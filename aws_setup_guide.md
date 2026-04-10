# Final AWS Setup Guide for MeetIntel CI/CD

You have already set up your ECR repository and basic IAM user. Follow these final steps to enable the automated deployment.

---

### Step 1: Create an IAM Role for App Runner
App Runner needs a role that allows it to pull images from your ECR repository.

1.  Go to the **IAM Console** -> **Roles** -> **Create role**.
2.  Select **AWS service** and then **App Runner**.
3.  Choose **App Runner** (under *Select your use case*).
4.  Attach the policy: `AWSAppRunnerLibreOfficeLayer` (or just search for `AmazonEC2ContainerRegistryReadOnly` and attach it).
5.  Name the role: `AppRunnerECRAccessRole`.
6.  **COPY the ARN** of this role (e.g., `arn:aws:iam::1234567890:role/AppRunnerECRAccessRole`).
7.  Add this ARN as a new GitHub Secret named: **`AWS_APP_RUNNER_ROLE_ARN`**.

---

### Step 2: Create the App Runner Service (Initial Setup)
Before the GitHub Action can *update* your service, you must create it once manually.

1.  Go to the **AWS App Runner Console** -> **Create service**.
2.  **Repository type**: Container registry.
3.  **Provider**: Amazon ECR.
4.  **Container image URI**: Click **Browse** and select your `meetintel` image. (If ECR is empty, push a test image first, or wait for the first GitHub Action build to finish).
5.  **Deployment settings**: Select **Manual**. (GitHub Actions will handle the updates).
6.  **Service configuration**:
    *   **Service name**: `meetintel-service`.
    *   **Port**: `5001`.
    *   **Runtime environment variables**: Add your `OPENAI_API_KEY`, `EMAIL_USER`, etc., here.
7.  **Security**:
    *   Select the `AppRunnerECRAccessRole` you created in Step 1 for the **Access role**.
8.  Click **Create & Deploy**.

---

### Step 3: Trigger your Pipeline!
Now you are ready to test the automation.

1.  Create a new branch in your local project: `git checkout -b working_branch`.
2.  Make a small change (e.g., update a comment in `MeetIntel_app.py`).
3.  `git add .` and `git commit -m "Testing CI/CD"`.
4.  `git push origin working_branch`.
5.  Go to GitHub and **Create a Pull Request** to merge `working_branch` into `main`.
6.  **Merge the Pull Request**.
7.  Go to the **Actions** tab on your GitHub repository. You should see the "Deploy to AWS App Runner" workflow starting!

Once it finishes, your app will be live at the URL provided in the App Runner console.
