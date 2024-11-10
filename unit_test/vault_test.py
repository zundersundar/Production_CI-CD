from dotenv import load_dotenv
import os
from heimdall_tools.vault import get_vault_secrets

load_dotenv()

def main():
    common_secrets, user_secrets= get_vault_secrets(
        os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
        os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
    )
    print(common_secrets)
    print(user_secrets)

main()