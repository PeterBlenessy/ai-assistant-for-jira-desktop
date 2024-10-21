# AI Assistant for Jira - desktop

This is a desktop application that integrates with Jira to provide AI-powered assistance to users.
It is built using Tauri 2, Vue 3, Quasar, and Vite.

# For developers

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Set up local Jira server using Docker with a PostgreSQL database

1. **Create a Docker Network**: Ensure both containers can communicate.
   ```bash
   docker network create jira-network
   ```

2. **Run PostgreSQL Container**:
   ```bash
   docker run --name postgres --network jira-network -e POSTGRES_USER=jirauser -e POSTGRES_PASSWORD=jirapassword -e POSTGRES_DB=jiradb -d postgres
   ```

3. **Run Jira Container**:
   ```bash
   docker run --name jira --network jira-network -p 8080:8080 -d atlassian/jira-software
   ```

4. **Configure Jira**: Access Jira at `http://localhost:8080` and configure the database connection using:
   - **Database Type**: PostgreSQL
   - **Hostname**: `postgres`
   - **Port**: `5432`
   - **Database**: `jiradb`
   - **Username**: `jirauser`
   - **Password**: `jirapassword`.

## Create a Personal Access Token for your Jira account
1. Go to your profile in Jira
2. Click on `Personal Access Tokens`
3. Click on `Create token`
