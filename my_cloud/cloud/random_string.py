import string
import random


def get_random_string(l):
    letters = string.ascii_lowercase
    random_string = ''.join(random.choice(letters) for i in range(l))
    
    return random_string