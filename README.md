
## Hospital management system

Full Stack assignment by Ziggle tech.

Backend: nodeJS+ Express,
Database: MongoDB

Functionalities:
1. Registering new Patient
2. Registering a new case for an existing patient.

Registering a new patient allots an id to the patient (pid).
After adding a new case, a doctor will be assigned to that case.
Doctors will be assigned in such a way that there is a uniform distribution of cases among them.

Database schema - [Link](https://github.com/cod-OR/hospital-management/blob/main/schema.js)

#APIs

Every response will have a "status" field.
If its value is "OK", it means the request has been processed successfully.
If its value is "ERROR", it means failure. In that case an error object will be present in the response containing a "message".

Following endpoints are available:

1. GET: "/api/patientlist"     -   To get a list of all patients
2. GET: "/api/doclist"         -   To get a list of doctors and total number cases of each doctor
3. GET: "/api/patienthistory"  -   To fetch patient history by patient id (Required input - pid).
4. GET: "/api/casecount"       -   To fetch total number of cases for a patient (Required input - pid).
5. POST: "/api/newpatient"     -   To register a new patient. (Required input: name, email, age(0-150), gender).
6. POST: "/api/newcase"        -   To register a new case for existing patient. (Required input - pid, description).

Live site: [Link](https://damp-basin-13149.herokuapp.com/)
