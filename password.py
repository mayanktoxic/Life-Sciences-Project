import random
import string

def generate_password(length=8):
    characters = string.digits + string.ascii_uppercase + string.ascii_lowercase 
    password = ''.join(random.choice(characters) for _ in range(length))
    return password

if __name__ == "__main__":
    print("Generated Password:", generate_password())
