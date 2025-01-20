import os
import hvac
import logging

VAULT_ADDR = os.getenv("VAULT_ADDR")
VAULT_USERNAME = os.getenv("VAULT_USERNAME")
VAULT_PASSWORD = os.getenv("VAULT_PASSWORD")
VAULT_USER_SECRETS_PATH = os.getenv("VAULT_USER_SECRETS_PATH")
OUTPUT_FILE = "/app/.env"

try:
    client = hvac.Client(url=VAULT_ADDR)
    login_response = client.auth.userpass.login(
        username=VAULT_USERNAME,
        password=VAULT_PASSWORD
    )
    if not client.is_authenticated():
        raise Exception("Failed to authenticate with Vault")

    secrets = client.secrets.kv.v2.read_secret(
        path=VAULT_USER_SECRETS_PATH,
        mount_point="towerwatchsecrets"
    )

    with open(OUTPUT_FILE, "w") as env_file:
        for key, value in secrets['data']['data'].items():
            env_file.write(f"{key}={value}\n")

    logging.info("Secrets successfully written to %s", OUTPUT_FILE)

except Exception as e:
    logging.error("Error fetching or writing secrets: %s", e)
    raise
