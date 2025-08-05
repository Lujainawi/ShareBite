# 🍽️ ShareBite

ShareBite is a community-based web platform that helps people share leftover food, find meals nearby, and volunteer to deliver food to others in need.  
It was created as part of a Software Development course, with a strong focus on social impact, accessibility, and secure modern web practices.

The platform enables users to post food donations with images, descriptions, and locations, and allows others to browse nearby posts using a custom filter by city. Flip cards provide an interactive way to explore food posts, and guests can preview content in read-only mode. Authenticated users can request volunteers to deliver meals, and volunteers can access tasks waiting to be completed. Firebase Authentication and Firestore are used for secure user login and data management, with additional input validation and modals for actions like confirmation, deletion, or volunteer request.

---

## 🧱 Technologies Used

HTML, CSS, JavaScript, Firebase (Auth and Firestore), Vite, and Cloudinary for image storage.  
The layout is based on the Dimension template by HTML5 UP and customized for our project’s branding and flow.  
We designed the UI with simplicity and clarity in mind, including responsive design, modals, floating buttons, and animated dropdowns.

---

## 🚀 To Run the Project Locally

**Backend (server)**  
- Navigate to the `server` directory  
- Run `npm install`  
- Run `npm start`

**Frontend (client)**  
- Navigate to the `client` directory  
- Run `npm install`  
- Run `npm run dev`

---

## 📁 Folder Structure

- `client/css` → Page-specific styles  
- `client/js` → Logic for pages like posts, sign in, and volunteer tasks  
- `client/pages` → HTML views  
- `client/src/firebase.js` → Firebase configuration  
- `images` → Icons and sample photos  

---

## 🎨 Design Credits

The design is based on [HTML5 UP – Dimension](https://html5up.net/dimension), licensed under [CC BY 3.0](https://html5up.net/license).  
Icons are from [Font Awesome](https://fontawesome.com)  
Images used in the demo are from [Unsplash](https://unsplash.com)  
Responsive layout tools by [AJ @ajlkn](https://github.com/ajlkn/responsive-tools)

---

## 👩‍💻 Contributors

- **Lujain Awidat**  
- **Soma Fakhereldein**

---

## 📄 License
This project is licensed under the **MIT License** – see `LICENSE.txt` for details.
