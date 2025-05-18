import json

import numpy as np
from scipy import stats


def create_test_case(name, observed, expected_ratios=None):
    # Calculate expected frequencies based on observed counts and ratios.
    if expected_ratios is None:
        n_groups = len(observed)
        expected_freqs = np.array([sum(observed) / n_groups] * n_groups)
    else:
        total_ratio = sum(expected_ratios)
        normalized_ratios = [r / total_ratio for r in expected_ratios]
        expected_freqs = np.array([sum(observed) * r for r in normalized_ratios])

    chi2_stat, p_value = stats.chisquare(f_obs=observed, f_exp=expected_freqs)

    return {
        "name": name,
        "observed": observed,
        "expectedRatios": expected_ratios,
        "expectedChiSquare": chi2_stat,
        "expectedPValue": p_value,
    }


def generate_test_cases():
    test_cases = [
        create_test_case("Equal 50:50 split - no mismatch", [1000, 1000]),
        create_test_case("Custom ratio example", [600, 400], [60, 40]),
    ]
    result = ""
    for i, case in enumerate(test_cases):
        json_str = json.dumps(case, indent=2)
        result += json_str
        if i < len(test_cases) - 1:
            result += ","
        result += "\n"
    return result


print(generate_test_cases())
