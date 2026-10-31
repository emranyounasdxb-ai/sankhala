// Role taxonomy supplied by the owner. These are not published vacancies.
export const jobCategories = [
  {
    name: "Office & Administration",
    roles: [
      "Receptionist",
      "Office Assistant",
      "Data Entry Operator",
      "Admin Assistant",
      "Document Controller",
    ],
  },
  {
    name: "Sales & Customer Service",
    roles: [
      "Sales Executive",
      "Telesales Executive",
      "Customer Service Executive",
      "Call Centre Agent",
      "Sales Team Leader",
    ],
  },
  {
    name: "HR & Recruitment",
    roles: [
      "HR Assistant",
      "HR Executive",
      "Recruitment Consultant",
      "Recruitment Coordinator",
      "Payroll Officer",
      "PRO",
    ],
  },
  {
    name: "Accounts & Finance",
    roles: ["Accounts Assistant", "Junior Accountant", "Accountant", "Cashier"],
  },
  {
    name: "Cleaning & Facilities",
    roles: [
      "Cleaner",
      "Housekeeping Attendant",
      "Cleaning Supervisor",
      "Office Boy / Office Girl",
      "Facility Supervisor",
    ],
  },
  {
    name: "Drivers & Transport",
    roles: [
      "Light Vehicle Driver",
      "Heavy Vehicle Driver",
      "Bus Driver",
      "Delivery Driver",
      "Transport Coordinator",
    ],
  },
  {
    name: "Warehouse & Logistics",
    roles: [
      "Warehouse Helper",
      "Picker & Packer",
      "Storekeeper",
      "Loader / Unloader",
      "Forklift Operator",
      "Logistics Coordinator",
    ],
  },
  {
    name: "Construction & Technical",
    roles: [
      "General Labourer",
      "Mason",
      "Carpenter",
      "Steel Fixer",
      "Electrician",
      "Plumber",
      "Welder",
      "Painter",
      "HVAC Technician",
    ],
  },
  {
    name: "Security",
    roles: ["Security Guard", "Security Supervisor", "CCTV Operator"],
    note: "Security roles require the relevant approvals and certification. Each confirmed vacancy must state its requirements.",
  },
  {
    name: "Hospitality & Catering",
    roles: [
      "Waiter / Waitress",
      "Kitchen Helper",
      "Cook",
      "Commis Chef",
      "Barista",
      "Steward",
      "Restaurant Supervisor",
    ],
  },
  {
    name: "Retail & Supermarket",
    roles: [
      "Sales Associate",
      "Merchandiser",
      "Shelf Stacker",
      "Supermarket Cashier",
      "Store Supervisor",
    ],
  },
  {
    name: "Manufacturing & Production",
    roles: [
      "Factory Helper",
      "Production Worker",
      "Machine Operator",
      "Packing Staff",
      "Maintenance Technician",
    ],
  },
];
export const priorityRoles = [
  "Cleaner",
  "Light Vehicle Driver",
  "Warehouse Helper",
  "Picker & Packer",
  "General Labourer",
  "Security Guard",
  "Sales Executive",
  "Telesales Executive",
  "Customer Service Executive",
  "Office Assistant",
  "Electrician",
  "HVAC Technician",
];
export const allRoleTitles = [
  ...new Set(jobCategories.flatMap((category) => category.roles)),
];
export const futureCVHref = (role: string) =>
  `/submit-cv?role=${encodeURIComponent(role)}`;

// Required editorial fields for a future employer-confirmed job post.
export const jobPostFields = [
  "Job title",
  "Location / emirate",
  "Hiring company",
  "Number of vacancies",
  "Salary range",
  "Duty hours",
  "Weekly off",
  "Experience",
  "Required licence / certification",
  "Benefits",
  "Closing date",
];
