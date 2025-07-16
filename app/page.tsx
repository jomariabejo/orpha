import React from "react";

const project = {
  title: "Hope on a Plate: A Life-Changing Nutritional Cookbook for Fighting Malnutrition Among Children",
  type: "Community Engagement Project",
  dateProposed: "May 27, 2025",
  implementationDate: "June 14-20, 2025",
  stakeholders: [
    "Beneficiaries and Staff of Missionaries of Charity: Home for the Sick and Malnourished Children",
    "Beneficiaries - from infants to adolescents",
    "Staff - age 20s to 40s, female"
  ],
  address: "Iñigo Ext., Poblacion District, Davao City, Davao Del Sur"
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-blue-700 dark:text-blue-300 mb-4 drop-shadow-lg">
          {project.title}
        </h1>
        <div className="flex flex-col gap-2 text-lg text-gray-700 dark:text-gray-200 mb-6">
          <div><span className="font-semibold">Project Type:</span> {project.type}</div>
          <div><span className="font-semibold">Date Proposed:</span> {project.dateProposed}</div>
          <div><span className="font-semibold">Implementation Date:</span> {project.implementationDate}</div>
          <div>
            <span className="font-semibold">Stakeholders:</span>
            <ul className="list-disc list-inside ml-4 mt-1">
              {project.stakeholders.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div><span className="font-semibold">Address:</span> {project.address}</div>
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-300 dark:border-gray-700">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps?q=Iñigo+Ext.,+Poblacion+District,+Davao+City,+Davao+Del+Sur&output=embed"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
