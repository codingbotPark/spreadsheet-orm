# How to Get Google Service Account Credentials

To use this library, you need a Google Service Account, which allows your application to authenticate and access your Google Sheet on your behalf. Follow these steps to get the necessary credentials.

## Step 1: Create a Google Cloud Project

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  If you don't have a project, create one by clicking the project dropdown at the top of the page and selecting **"New Project"**.
3.  Give your project a name and click **"Create"**.

## Step 2: Enable the Google Sheets API

1.  In your project's dashboard, navigate to the **"APIs & Services"** > **"Library"** section.
2.  Search for **"Google Sheets API"**.
3.  Click on it and then click the **"Enable"** button.

## Step 3: Create a Service Account

1.  In the **"APIs & Services"** section, go to **"Credentials"**.
2.  Click **"Create Credentials"** and select **"Service account"**.
3.  Fill in the service account details:
    *   **Service account name**: Give it a descriptive name (e.g., "Spreadsheet ORM Bot").
    *   **Service account ID**: This will be generated automatically.
    *   **Description**: Optional, but helpful.
4.  Click **"Create and Continue"**.
5.  **Grant access (Optional)**: You can skip granting this service account a role for now by clicking **"Continue"**.
6.  **Grant users access (Optional)**: You can also skip this step. Click **"Done"**.

## Step 4: Generate a JSON Key

1.  You should now see your newly created service account in the credentials list.
2.  Click on the service account's email address to manage it.
3.  Go to the **"KEYS"** tab.
4.  Click **"Add Key"** and select **"Create new key"**.
5.  Choose **JSON** as the key type and click **"Create"**.
6.  A JSON file will be automatically downloaded to your computer. **This is your credential file. Keep it safe and do not commit it to public repositories!**

    The downloaded JSON file will contain your `client_email` and `private_key`.

## Step 5: Share Your Google Sheet

1.  Open the Google Sheet you want to use as a database.
2.  Click the **"Share"** button in the top-right corner.
3.  In the downloaded JSON file, find the `client_email` value (it looks like `...-..@...iam.gserviceaccount.com`).
4.  Paste this email address into the "Add people and groups" field.
5.  Give it **"Editor"** permissions.
6.  Click **"Send"** (or "Share").

You are now ready to use the credentials in your application!
