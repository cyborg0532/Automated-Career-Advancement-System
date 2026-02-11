# Startup Guide (Hindi & English)

Signup nahi ho raha kyunki **Database (MongoDB)** start nahi hai.
(Signup is failing because the Database is not running.)

Follow these steps to fix everything:

## Step 1: Install & Start MongoDB (Database)
Ye sabse important step hai. Bina database ke Server nahi chalega.

1.  **Download**: Agar installed nahi hai, to [MongoDB Community Server](https://www.mongodb.com/try/download/community) download karke install karein. (Install "MongoD" as a Service).
2.  **Start Connection**:
    - Open **Task Manager** -> **Services** tab.
    - Find `MongoDB` or `MongoD`.
    - Right click -> **Start**.
    - *OR* Open a new terminal and type:
      ```powershell
      mongod
      ```
      (Agar error aaye, to `C:\data\db` folder create karein c drive me).

## Step 2: Start Backend Server
1.  Is folder me terminal open karein: `Automated-Career-Advancement-System`
2.  Command run karein:
    ```powershell
    node server.js
    ```
3.  **Correct Output**:
    ```
    Server running on port 3000
    MongoDB Connected...  <-- Ye aana zaroori hai!
    ```

## Step 3: Open App
1.  Browser open karein.
2.  Go to: **http://localhost:3000**
3.  Ab **Signup** try karein.

---

## Troubleshooting "ECONNREFUSED"
Agar abhi bhi `Database connection error` aa raha hai:
1. Check karein ki MongoDB port `27017` par chal raha hai.
2. `.env` file open karein aur check karein `MONGO_URI=mongodb://127.0.0.1:27017/carrier_advancement_system`.

## Routing & Structure Check
Maine pura code check kiya hai:
- **Frontend**: `index.html` call karta hai `/api/auth/signup`.
- **Backend Route**: `routes/authRoutes.js` handle karta hai `/signup`.
- **Controller**: `authController.js` data save karta hai DB me.

Sab kuch sahi set hai using `Express Router`. Issue sirf database connection ka hai.
