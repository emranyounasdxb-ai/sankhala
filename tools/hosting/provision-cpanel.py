#!/usr/bin/env python3
"""Provision only the owner's Sankhala account. Never print generated secrets."""
import base64
import json
import os
from pathlib import Path
import pwd
import secrets
import subprocess
from urllib.parse import quote

HOME = Path('/home/sankhala')
APP = HOME / 'apps/sankhala'
PRIVATE = HOME / 'private/sankhala-ats'
if pwd.getpwuid(os.getuid()).pw_name != 'sankhala' or not APP.is_dir():
    raise SystemExit('Run only as the sankhala cPanel user in its staged checkout.')
os.umask(0o077)
PRIVATE.mkdir(parents=True, exist_ok=True, mode=0o700)
for name in ['documents', 'backups']:
    (PRIVATE / name).mkdir(exist_ok=True, mode=0o700)

def api(module, function, **parameters):
    args = ['/usr/local/cpanel/bin/uapi', '--output=json', module, function]
    args.extend(key + '=' + quote(str(value), safe='') for key, value in parameters.items())
    result = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    try:
        payload = json.loads(result.stdout)['result']
    except (ValueError, KeyError):
        raise SystemExit('cPanel operation could not be verified: ' + module + '.' + function)
    if result.returncode != 0 or payload.get('status') != 1:
        raise SystemExit('cPanel operation failed: ' + module + '.' + function)
    return payload.get('data')

state_file = PRIVATE / 'provision.json'
had_state = state_file.exists()
if had_state:
    state = json.loads(state_file.read_text())
else:
    state = {'version': 1, 'database': 'sankhala_ats', 'app_user': 'sankhala_atsapp', 'migration_user': 'sankhala_atsmig',
             'app_password': secrets.token_hex(32), 'migration_password': secrets.token_hex(32),
             'auth_secret': secrets.token_hex(48), 'backup_key': base64.b64encode(secrets.token_bytes(32)).decode('ascii'),
             'health_token': secrets.token_hex(32),
             'smtp_user': 'ats-notifications@sankhala.ae', 'smtp_password': secrets.token_hex(32)}
    with state_file.open('x') as stream:
        json.dump(state, stream)
    os.chmod(str(state_file), 0o600)
if state.get('database') != 'sankhala_ats':
    raise SystemExit('Unexpected database in provision state.')
databases = api('Mysql', 'list_databases') or []
if not any(item.get('database') == state['database'] for item in databases):
    api('Mysql', 'create_database', name=state['database'])
users = api('Mysql', 'list_users') or []
names = set(item.get('user') or item.get('name') for item in users)
for prefix, privileges in [('app', 'SELECT,INSERT,UPDATE,DELETE'), ('migration', 'ALL PRIVILEGES')]:
    user = state[prefix + '_user']
    if user in names and not had_state:
        raise SystemExit('An existing database user needs review; its password was not changed.')
    if user not in names:
        api('Mysql', 'create_user', name=user, password=state[prefix + '_password'])
    api('Mysql', 'set_privileges_on_database', user=user, database=state['database'], privileges=privileges)

mailboxes = api('Email', 'list_pops') or []
mail_names = set(item.get('email') or item.get('login') for item in mailboxes)
if state['smtp_user'] in mail_names and not had_state:
    raise SystemExit('An existing service mailbox needs review; its password was not changed.')
if state['smtp_user'] not in mail_names:
    api('Email', 'add_pop', email='ats-notifications', domain='sankhala.ae', password=state['smtp_password'], quota=100, send_welcome_email=0)

config = {
    'SEO_INDEXABLE': 'false', 'SITE_URL': 'https://sankhala.ae', 'ATS_ENABLED': 'true',
    'ATS_DB_HOST': '127.0.0.1', 'ATS_DB_PORT': '3306', 'ATS_DB_NAME': state['database'],
    'ATS_DB_USER': state['app_user'], 'ATS_DB_PASSWORD': state['app_password'],
    'BETTER_AUTH_SECRET': state['auth_secret'], 'ATS_PUBLIC_ORIGIN': 'https://sankhala.ae',
    'ATS_HEALTH_TOKEN': state['health_token'],
    'ATS_INITIAL_ADMIN_EMAIL': 'admin@sankhala.ae', 'ATS_HR_EMAIL': 'admin@sankhala.ae',
    'ATS_PRIVATE_ROOT': str(PRIVATE), 'ATS_RETENTION_DAYS': '365',
    'ATS_SMTP_HOST': 'ded6959.inmotionhosting.com', 'ATS_SMTP_PORT': '465',
    'ATS_SMTP_USER': state['smtp_user'], 'ATS_SMTP_PASSWORD': state['smtp_password'], 'ATS_SMTP_FROM': state['smtp_user'],
    'ATS_BACKUP_KEY': state['backup_key'], 'ATS_BACKUP_RETENTION_DAYS': '30', 'ATS_DUMP_COMMAND': '/usr/bin/mariadb-dump',
    'ATS_AV_COMMAND': '/home/sankhala/.local/clamav-1.5.4/usr/local/bin/clamscan',
    'ATS_AV_LIBRARY_PATH': '/home/sankhala/.local/clamav-1.5.4/usr/local/lib64:/home/sankhala/.local/clamav-1.5.4/usr/local/lib',
    'ATS_AV_DATABASE': str(PRIVATE / 'antivirus'),
    'ATS_AV_CERTIFICATES': '/home/sankhala/.local/clamav-1.5.4/usr/local/etc/certs',
}
env_file = PRIVATE / 'application.env'
if env_file.exists():
    print('Existing application environment preserved; no secrets overwritten.')
else:
    with env_file.open('x') as stream:
        stream.write('# Sankhala ATS private production configuration\n')
        for name, value in config.items():
            stream.write(name + '=' + value + '\n')
    os.chmod(str(env_file), 0o600)
if not (APP / '.env.production.local').exists():
    (APP / '.env.production.local').symlink_to(env_file)
migration_file = PRIVATE / 'migration.env'
if not migration_file.exists():
    with migration_file.open('x') as stream:
        for name, value in config.items():
            stream.write(name + '=' + value + '\n')
        stream.write('ATS_MIGRATION_USER=' + state['migration_user'] + '\n')
        stream.write('ATS_MIGRATION_PASSWORD=' + state['migration_password'] + '\n')
    os.chmod(str(migration_file), 0o600)
print('Sankhala database users, private application configuration and transactional sender are ready.')
print('HR notification mailbox present in this cPanel account: ' + str('admin@sankhala.ae' in mail_names))
