import json
from bitarray import bitarray

from datetime import date

def read_goals():
    cookies = None
    try:
        with open('cookie_store.json') as f:
            cookies = json.load(f)
    except IOError as e:
        cookies = [{
                'last_check' : date.today().isoformat(),
                'stream' : bitarray(32).to01()
            }]
    return cookies

def save_goals(cookies):
    with open('cookie_store.json', 'wt') as f:
        json.dump(cookies, f)

def main():
    print('===================')
    print('| Day one concept |')
    print('^^^^^^^^^^^^^^^^^^^')
    cookies = read_goals()
    print('I found this data: {}'.format(read_goals()))
    save_goals( cookies )
    print('Saved and this is the end.')

if __name__ == '__main__':
    main()
