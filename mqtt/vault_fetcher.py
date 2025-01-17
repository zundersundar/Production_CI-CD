import os
from dotenv import set_key
import hvac

# Path to the .env file
ENV_FILE_PATH = "./.env"

def write_to_env_file(key, value):
    """Write a key-value pair to the .env file."""
    set_key(ENV_FILE_PATH, key, value)

def fetch_secrets_from_vault():
    """Fetch secrets from Vault and write them to .env file."""
    vault_addr = os.getenv("VAULT_ADDR")
    vault_username = os.getenv("VAULT_USERNAME")
    vault_password = os.getenv("VAULT_PASSWORD")
    secrets_path = os.getenv("VAULT_USER_SECRETS_PATH")

    # Authenticate with Vault
    client = hvac.Client(url=vault_addr)
    login_response = client.auth.userpass.login(username=vault_username, password=vault_password)
    if not client.is_authenticated():
        raise Exception("Vault authentication failed!")

    # Fetch secrets
    common_secrets = client.secrets.kv.v2.read_secret(path="commonsecrets", mount_point="towerwatchsecrets")['data']['data']
    user_secrets = client.secrets.kv.v2.read_secret(path=secrets_path, mount_point="towerwatchsecrets")['data']['data']

    # Write secrets to .env
    for key, value in common_secrets.items():
        write_to_env_file(key, value)
    for key, value in user_secrets.items():
        write_to_env_file(key, value)

    print("Secrets fetched and written to .env successfully.")

if __name__ == "__main__":
    fetch_secrets_from_vault()
