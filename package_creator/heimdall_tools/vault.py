#This module reads secrets from Vault and returns secrets as two dicts
#common_secrets contains secrets read from "commonsecrets" path from towerwatchsecrets engine
#user_secrets contains secrets read from the unique path for user which is passed as argument

import hvac

def get_vault_secrets(VAULT_ADDR, SECRETS_PATH, USERNAME, PASSWORD):
    client = hvac.Client(url=VAULT_ADDR)
    VAULT_USER_SECRETS_PATH = SECRETS_PATH
    login_response = client.auth.userpass.login(
        username= USERNAME,
        password= PASSWORD
    )
    if not client.is_authenticated():
        raise Exception("Vault authentication failed")

    common_secret_path = client.secrets.kv.v2.read_secret(path="commonsecrets", mount_point="towerwatchsecrets")
    individual_secret_path = client.secrets.kv.v2.read_secret(path=VAULT_USER_SECRETS_PATH, mount_point="towerwatchsecrets")
    common_secrets = common_secret_path['data']['data']
    user_secrets = individual_secret_path['data']['data']
    return common_secrets, user_secrets

    '''
    example usage-
    
    def main():
        common_secrets, user_secrets= get_vault_secrets(
            os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
            os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
        )
        print(common_secrets)
        print(user_secrets)
    '''