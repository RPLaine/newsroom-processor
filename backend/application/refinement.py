import json

def refine_response(llm_response):
    refinement_steps = []
    refinement_steps.append(llm_response.text)

    value = llm_response.text
    try:
        value = value.split('<|im_assistant|>', 1)[1].strip()
        if '<|im_' in value:
            value = value.split('<|im_')[0].strip()
    except Exception as e:
        pass

    refinement_steps.append(value)

    # try:
    #     value = value.rsplit('}', 1)[0] + '}'
    # except Exception as e:
    #     pass

    # refinement_steps.append(value)

    try:
        value = json.loads(value)
    except json.JSONDecodeError:
        bruteforce_value = value
        while len(bruteforce_value) > 0:
            # remove one letter at a time from the end of the string
            bruteforce_value = bruteforce_value[:-1]
            try:
                value = json.loads(bruteforce_value)
                break
            except json.JSONDecodeError:
                continue

    refinement_steps.append(value)
    
    print('-' * 20)
    print("Refinement Steps:")
    for step in refinement_steps:
        print('-' * 10)
        print('Step number:', refinement_steps.index(step) + 1)
        print('-' * 10)
        print(step)
    print('-' * 20)

    return value