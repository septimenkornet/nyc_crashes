import json, sys, pandas
from collections import defaultdict

action_keys = [
    ("Driver Action 1 Unit 1 Description", '-- 1'),
    ("Driver Action 2 Unit 1 Description", '-- 1'),
    ("Driver Action 1 Unit 2 Description", '-- 2'),
    ("Driver Action 2 Unit 2 Description", '-- 2')
]

causecount = defaultdict(int)

def crashrow(crashprops):
    any_actions = False
    for action_key_duple in action_keys:
        action_key, action_unit = action_key_duple
        action = crashprops[action_key]
        if not (action == None or action == "No Contributing Action" or action == ''):
            causecount[action + action_unit] += 1
            any_actions = True
    if any_actions == False:
        causecount['No cause given, 1 or 2'] += 1

crashes = pandas.read_excel(sys.argv[1])

N = crashes.shape[0]

crashes = crashes.fillna('')

crashes.apply(crashrow, axis=1)

items = sorted(causecount.items(), key=lambda x: x[1], reverse=True)

print('Cause|Count|Percent')

for item in items:
    count = item[1]
    print(
        f'{item[0]}|{count}|{((count/N) * 100):.1f}'
    )




