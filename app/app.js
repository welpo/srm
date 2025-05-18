function calculateChiSquare(observed, expected) {
  let chiSquare = 0;
  if (observed.length !== expected.length || observed.length < 2) {
    console.error("Invalid input lengths for calculateChiSquare");
    return NaN;
  }
  for (let i = 0; i < observed.length; i++) {
    if (expected[i] <= 0) {
      console.error(
        "Expected count is zero or negative, division by zero avoided."
      );
      return NaN;
    }
    chiSquare += Math.pow(observed[i] - expected[i], 2) / expected[i];
  }
  return chiSquare;
}

function logGamma(x) {
  const g = 7;
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  x -= 1;
  let a = p[0];
  let t = x + g + 0.5;
  for (let i = 1; i < p.length; i++) {
    a += p[i] / (x + i);
  }
  return (
    (x + 0.5) * Math.log(t) -
    t +
    Math.log((2 * Math.PI * a) / Math.sqrt(2 * Math.PI))
  );
}

function incompleteGammaP(a, x) {
  if (x < 0 || a <= 0) {
    return 0.0;
  }
  if (x === 0) {
    return 0.0;
  }
  if (x > 1.0e30) {
    // Handle potential overflow for large x.
    return 1.0;
  }

  const logGammaA = logGamma(a);

  if (x < a + 1.0) {
    // Series expansion.
    let sum = 1.0 / a;
    let term = 1.0 / a;
    for (let k = 1; k < 100; k++) {
      term *= x / (a + k);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1.0e-10) {
        // Check convergence.
        break;
      }
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGammaA);
  } else {
    // Continued fraction representation.
    const maxIter = 100;
    const epsilon = 1.0e-10;
    let b = x + 1.0 - a;
    let c = 1.0 / epsilon;
    let d = 1.0 / b;
    let h = d;
    let an, del;

    for (let i = 1; i <= maxIter; i++) {
      an = -i * (i - a);
      b += 2.0;
      d = an * d + b;
      if (Math.abs(d) < epsilon) d = epsilon; // Avoid division by zero.
      c = b + an / c;
      if (Math.abs(c) < epsilon) c = epsilon;
      d = 1.0 / d;
      del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < epsilon) break; // Check convergence.
    }
    return 1.0 - Math.exp(-x + a * Math.log(x) - logGammaA) * h;
  }
}

function chiSquarePvalue(chiSqStat, df) {
  // The p-value is 1 - P(df/2, chiSqStat/2),
  // where P is the regularised lower incomplete gamma function.
  if (chiSqStat < 0 || df <= 0) {
    return 1.0; // Invalid input, return non-significant p-value.
  }
  return 1.0 - incompleteGammaP(df / 2.0, chiSqStat / 2.0);
}

function performSRMCalculation(observedCounts, expectedRatios = null) {
  if (!Array.isArray(observedCounts) || observedCounts.length < 2) {
    throw new Error(
      "Observed counts must be an array with at least two numbers."
    );
  }
  if (
    observedCounts.some(
      (count) => typeof count !== "number" || isNaN(count) || count <= 0
    )
  ) {
    throw new Error("All observed counts must be positive numbers.");
  }
  const numGroups = observedCounts.length;
  let actualExpectedRatios;
  if (expectedRatios === null || expectedRatios === undefined) {
    // Equal split.
    actualExpectedRatios = Array(numGroups).fill(1 / numGroups);
  } else {
    if (!Array.isArray(expectedRatios) || expectedRatios.length !== numGroups) {
      throw new Error(
        `Number of expected ratios (${
          expectedRatios?.length || 0
        }) must match number of observed counts (${numGroups}).`
      );
    }
    if (
      expectedRatios.some(
        (ratio) => typeof ratio !== "number" || isNaN(ratio) || ratio <= 0
      )
    ) {
      throw new Error("All expected ratios must be positive numbers.");
    }
    // Normalise ratios.
    const totalRatio = expectedRatios.reduce((sum, ratio) => sum + ratio, 0);
    if (totalRatio <= 0) {
      throw new Error("Sum of expected ratios must be positive.");
    }
    actualExpectedRatios = expectedRatios.map((ratio) => ratio / totalRatio);
  }
  const totalObserved = observedCounts.reduce((sum, count) => sum + count, 0);
  const expectedCounts = actualExpectedRatios.map(
    (ratio) => ratio * totalObserved
  );
  const chiSquare = calculateChiSquare(observedCounts, expectedCounts);
  if (isNaN(chiSquare)) {
    throw new Error(
      "Chi-square calculation resulted in NaN (check inputs/expected counts)."
    );
  }
  const df = numGroups - 1;
  const pValue = chiSquarePvalue(chiSquare, df);
  return {
    chiSquare: chiSquare,
    pValue: pValue,
    df: df,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const observedCountsInput = document.getElementById("observedCounts");
  const expectedRatioInput = document.getElementById("expectedRatio");
  const equalDistribution = document.getElementById("equalDistribution");
  const customDistribution = document.getElementById("customDistribution");
  const ratioContainer = document.getElementById("ratioContainer");
  const resultsContainer = document.getElementById("resultsContainer");
  const chiSquareValueEl = document.getElementById("chiSquareValue");
  const pValueEl = document.getElementById("pValue");
  const verdictEl = document.getElementById("verdict");
  const expectationTableBody = document.getElementById("expectationTableBody");
  const dataPreviewElement = document.getElementById("dataPreview");
  const ratioPreviewElement = document.getElementById("ratioPreview");
  const countsErrorElement = document.getElementById("countsError");
  const ratioErrorElement = document.getElementById("ratioError");
  const explanationElement = document.getElementById("explanationText");
  const shareBtn = document.getElementById("shareBtn");
  const robotElement = document.querySelector(".robot");

  const debouncedCalculate = debounce(validateAndCalculate, 80);

  function validateAndCalculate() {
    const counts = parseNumberInput(observedCountsInput.value);
    if (counts.length >= 2) {
      calculateSRM();
    } else {
      resetRobot();
      resultsContainer.classList.remove("visible");
      shareBtn.style.display = "none";
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  equalDistribution.addEventListener("change", function () {
    if (this.checked) {
      ratioContainer.style.display = "none";
      hideError(ratioErrorElement);
      calculateSRM();
    }
  });

  customDistribution.addEventListener("change", function () {
    if (this.checked) {
      ratioContainer.style.display = "block";
      expectedRatioInput.focus();
      updateRatioPreview();
      hasInteractedWithRatio = false;
      hideError(ratioErrorElement);
      calculateSRM();
    }
  });

  observedCountsInput.addEventListener("focus", function () {
    hasInteractedWithCounts = true;
  });

  observedCountsInput.addEventListener("input", function () {
    updateDataPreview();
    if (customDistribution.checked) {
      updateRatioPreview();
    }
    debouncedCalculate();
  });

  observedCountsInput.addEventListener("blur", function () {
    const counts = parseNumberInput(observedCountsInput.value);
    if (observedCountsInput.value.trim() !== "" && counts.length < 2) {
      showError(
        countsErrorElement,
        "Please enter at least two valid visitor counts."
      );
    }
  });

  expectedRatioInput.addEventListener("input", function () {
    updateRatioPreview();
    debouncedCalculate();
  });

  expectedRatioInput.addEventListener("blur", function () {
    if (!customDistribution.checked) return;
    const counts = parseNumberInput(observedCountsInput.value);
    if (counts.length < 2) return;
    const ratios = parseRatioInput(expectedRatioInput.value);
    if (expectedRatioInput.value.trim() !== "") {
      if (ratios.length === 0) {
        showError(
          ratioErrorElement,
          "Please enter your expected ratios for custom distribution."
        );
      } else if (ratios.length !== counts.length) {
        showError(
          ratioErrorElement,
          `Number of ratios (${ratios.length}) must match number of observed counts (${counts.length}).`
        );
      }
    }
  });

  function updateDataPreview() {
    const numbers = parseNumberInput(observedCountsInput.value);
    dataPreviewElement.innerHTML = "";
    if (numbers.length > 0) {
      numbers.forEach((num) => {
        const chip = document.createElement("div");
        chip.className = "data-chip";
        chip.textContent = formatNumber(num, 2);
        dataPreviewElement.appendChild(chip);
      });
    }
  }

  function updateRatioPreview() {
    const ratios = parseRatioInput(expectedRatioInput.value);
    const observedCounts = parseNumberInput(observedCountsInput.value);
    ratioPreviewElement.innerHTML = "";
    if (observedCounts.length === 0) return;
    if (
      ratios.length > observedCounts.length &&
      expectedRatioInput.value.trim() !== ""
    ) {
      showError(
        ratioErrorElement,
        `Number of ratios (${ratios.length}) must match number of observed counts (${observedCounts.length}).`
      );
      return;
    }
    let total = ratios.reduce((sum, ratio) => sum + ratio, 0) || 1;
    for (let i = 0; i < observedCounts.length; i++) {
      const chip = document.createElement("div");
      chip.className = "ratio-chip";
      if (i < ratios.length) {
        const percentage = formatNumber((ratios[i] / total) * 100, 1);
        chip.innerHTML = `<span class="ratio-value">${percentage}%</span>`;
      } else {
        chip.innerHTML = `<span class="ratio-value missing">?%</span>`;
      }
      ratioPreviewElement.appendChild(chip);
    }
  }

  function showError(element, message) {
    element.textContent = message;
    element.classList.add("visible");
  }

  function hideError(element) {
    element.classList.remove("visible");
  }

  function calculateSRM() {
    hideError(countsErrorElement);
    resetRobot();
    let observedCounts,
      expectedRatios = null;
    try {
      observedCounts = parseNumberInput(observedCountsInput.value);
      if (observedCounts.length === 0) {
        resultsContainer.classList.remove("visible");
        shareBtn.style.display = "none";
        return;
      }
      if (customDistribution.checked) {
        expectedRatios = parseRatioInput(expectedRatioInput.value);
        // Only show ratio errors if user has interacted with the field,
        // or if there's already content in the field.
        if (expectedRatioInput.value.trim() !== "") {
          if (expectedRatios.length > observedCounts.length) {
            showError(
              ratioErrorElement,
              `Number of ratios (${expectedRatios.length}) must match number of observed counts (${observedCounts.length}).`
            );
            resultsContainer.classList.remove("visible");
            shareBtn.style.display = "none";
            ratioPreviewElement.innerHTML = "";
            return;
          } else {
            hideError(ratioErrorElement);
          }
          if (expectedRatios.length === 0) {
            return;
          }
          if (expectedRatios.length !== observedCounts.length) {
            return;
          }
        } else {
          expectedRatios = null;
        }
      }
      const results = performSRMCalculation(observedCounts, expectedRatios);
      chiSquareValueEl.textContent = formatNumber(results.chiSquare, 4);
      pValueEl.textContent = formatPValue(results.pValue);
      if (results.pValue < 0.01) {
        verdictEl.textContent = "Sample Ratio Mismatch detected";
        verdictEl.className = "verdict is-mismatch";
      } else if (results.pValue < 0.05) {
        verdictEl.textContent = "Possible Sample Ratio Mismatch";
        verdictEl.className = "verdict possible-mismatch";
      } else {
        verdictEl.textContent = "No significant Sample Ratio Mismatch";
        verdictEl.className = "verdict no-mismatch";
      }
      const pValuePercent = formatPValue(results.pValue * 100, 1);
      let explanationText = `If your randomisation system worked as intended, there'd be a ${pValuePercent}% probability of seeing a difference at least this large.`;
      if (results.pValue < 0.01) {
        explanationText +=
          "<br>This indicates a significant Sample Ratio Mismatch. <strong>Experiment results are unreliable under these conditions</strong>. Recommendation: investigate the root cause (instrumentation, randomisation, bots…) before analysis.";
        robotElement.className = "robot is-srm";
      } else if (results.pValue < 0.05) {
        explanationText +=
          "<br>The difference might not be purely due to chance and warrants caution.";
        robotElement.className = "robot possible-srm";
      } else {
        explanationText +=
          "<br>The observed difference is reasonably likely to occur by chance.";
        robotElement.className = "robot no-srm";
      }
      explanationElement.innerHTML = explanationText;
      const totalObserved = observedCounts.reduce(
        (sum, count) => sum + count,
        0
      );
      let actualRatios;
      if (expectedRatios) {
        const totalRatio = expectedRatios.reduce(
          (sum, ratio) => sum + ratio,
          0
        );
        actualRatios = expectedRatios.map((r) => r / totalRatio);
      } else {
        actualRatios = Array(observedCounts.length).fill(
          1 / observedCounts.length
        );
      }
      const expectedCountsForTable = actualRatios.map(
        (ratio) => ratio * totalObserved
      );
      updateExpectationTable(observedCounts, expectedCountsForTable);
      resultsContainer.classList.add("visible");
      shareBtn.style.display = "flex";
    } catch (error) {
      console.error("SRM Calculation Error:", error);
      if (error.message.includes("ratios") || error.message.includes("ratio")) {
        showError(ratioErrorElement, error.message);
      } else {
        showError(countsErrorElement, error.message);
      }
      resultsContainer.classList.remove("visible");
      shareBtn.style.display = "none";
    }
  }

  function resetRobot() {
    robotElement.className = "robot";
  }

  function formatPValue(pValue, significantDigits = 6) {
    const threshold = Math.pow(10, -significantDigits);
    if (pValue < threshold) {
      // Very small p-value, show as "< threshold".
      return `< ${threshold.toLocaleString(undefined, {
        maximumFractionDigits: significantDigits,
        minimumFractionDigits: significantDigits,
      })}`;
    }
    return pValue.toLocaleString(undefined, {
      maximumFractionDigits: significantDigits,
    });
  }

  function updateExpectationTable(observed, expected) {
    expectationTableBody.innerHTML = "";
    observed.forEach((obs, index) => {
      const exp = expected[index];
      const diff = obs - exp;
      const percentDiff = (diff / exp) * 100;
      const row = document.createElement("tr");
      const observedCell = document.createElement("td");
      observedCell.textContent = formatNumber(obs, 2);
      const expectedCell = document.createElement("td");
      expectedCell.textContent = formatNumber(exp, 2);
      const diffCell = document.createElement("td");
      diffCell.textContent = `${diff > 0 ? "+" : diff < 0 ? "-" : ""}${Math.abs(
        diff
      ).toFixed(1)} (${percentDiff.toFixed(2)}%)`;
      row.appendChild(observedCell);
      row.appendChild(expectedCell);
      row.appendChild(diffCell);
      expectationTableBody.appendChild(row);
    });
  }

  function parseNumberInput(input) {
    if (!input || input.trim() === "") return [];
    // Support both comma and period as decimal separators.
    const standardized = input
      // Handle decimal commas (e.g. 2,5 -> 2.5).
      .replace(/(\d+),(\d+)/g, "$1.$2")
      // Replace any non-digit, non-period with a space.
      .replace(/[^\d.]+/g, " ");
    // Split by space and filter out empty strings.
    return standardized
      .split(" ")
      .filter((val) => val.trim() !== "")
      .map((val) => parseFloat(val))
      .filter((num) => !isNaN(num));
  }

  function parseRatioInput(input) {
    if (!input || input.trim() === "") return [];
    const sanitizedInput = input.replace(/%/g, "");
    return parseNumberInput(sanitizedInput);
  }

  function formatNumber(num, decimalPlaces) {
    return num.toLocaleString(undefined, {
      maximumFractionDigits: decimalPlaces,
    });
  }

  function encodeSRMParametersToURL() {
    const params = {};
    const obsValue = observedCountsInput.value.trim();
    if (obsValue) {
      params.o = obsValue;
    }
    if (customDistribution.checked) {
      params.d = "c";
      const ratioValue = expectedRatioInput.value.trim();
      if (ratioValue) {
        params.e = ratioValue;
      }
    } else {
      if (obsValue) {
        params.d = "e";
      }
    }
    const validParams = Object.entries(params).filter(([key, value]) => value);
    if (validParams.length === 0) {
      return `${window.location.origin}${window.location.pathname}`;
    }
    const queryString = validParams
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
    return `${window.location.origin}${window.location.pathname}?${queryString}`;
  }

  function decodeParametersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("o") && !urlParams.has("d")) {
      return false;
    }
    if (urlParams.has("o")) {
      observedCountsInput.value = urlParams.get("o");
      updateDataPreview();
    }
    if (urlParams.has("d")) {
      const dValue = urlParams.get("d");
      if (dValue === "c") {
        customDistribution.checked = true;
        ratioContainer.style.display = "block";
        if (urlParams.has("e")) {
          expectedRatioInput.value = urlParams.get("e"); // Use 'e'
          updateRatioPreview();
        } else {
          updateRatioPreview();
        }
      } else {
        equalDistribution.checked = true;
        ratioContainer.style.display = "none";
      }
    } else {
      equalDistribution.checked = true;
      ratioContainer.style.display = "none";
    }
    calculateSRM();
    return true;
  }

  shareBtn.addEventListener("click", handleSRMShareButtonClick);
  function handleSRMShareButtonClick() {
    const url = encodeSRMParametersToURL();
    window.history.pushState({}, "", url); // Update URL.
    navigator.clipboard.writeText(url).then(() => {
      const originalHTML = shareBtn.innerHTML;
      shareBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Link copied
          `;
      shareBtn.disabled = true;
      setTimeout(() => {
        shareBtn.innerHTML = originalHTML;
        shareBtn.disabled = false;
      }, 2000);
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.size > 0) {
    try {
      decodeParametersFromURL();
    } catch (error) {
      console.error("Error decoding URL parameters:", error);
    }
  }
  if (urlParams.get("test") !== null) {
    console.log("Loading test script…");
    const script = document.createElement("script");
    script.src = "tests.js";
    document.head.appendChild(script);
  }
  decodeParametersFromURL();
});
