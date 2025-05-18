console.log("tests.js loaded");

const TOLERANCE = 0.0001;
let passedTests = 0;
let failedTests = 0;
let failedTestDetails = [];

function areClose(a, b) {
  if (a === b) return true;
  if (isNaN(a) || isNaN(b) || !isFinite(a) || !isFinite(b)) return false;
  const diff = Math.abs(a - b);
  const relError = diff / Math.min(Math.abs(a), Math.abs(b));
  return relError <= TOLERANCE;
}

function createDebugPanel() {
  if (document.getElementById("debug-panel")) return;

  const debugPanel = document.createElement("div");
  debugPanel.id = "debug-panel";
  debugPanel.style.cssText =
    "position: fixed; bottom: 10px; right: 10px; background: rgba(30,30,30,0.9); color: white; padding: 10px; width: 90%; max-width: 550px; max-height: 60vh; overflow-y: auto; font-family: monospace; font-size: 12px; z-index: 9999; border-radius: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: all 0.3s ease; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.2);";

  const header = document.createElement("div");
  header.style.cssText =
    "display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);";

  const title = document.createElement("h3");
  title.textContent = "🧪 SRM Test Results";
  title.style.cssText = "margin: 0; font-size: 14px; color: #fff;";

  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.style.cssText =
    "background: none; border: none; color: #ccc; font-size: 18px; cursor: pointer; padding: 0 5px; line-height: 1;";
  closeButton.onclick = function () {
    debugPanel.style.opacity = "0";
    setTimeout(() => {
      debugPanel.style.display = "none";
    }, 300);
  };

  header.appendChild(title);
  header.appendChild(closeButton);
  debugPanel.appendChild(header);

  const content = document.createElement("div");
  content.id = "debug-content";
  content.style.cssText = "overflow-y: auto; max-height: calc(60vh - 100px);";
  debugPanel.appendChild(content);

  const controls = document.createElement("div");
  controls.style.cssText =
    "display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);";

  const clearButton = document.createElement("button");
  clearButton.textContent = "Clear Log";
  clearButton.style.cssText =
    "background: #555; border: none; color: white; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;";
  clearButton.onclick = function () {
    document.getElementById("debug-content").innerHTML = "";
  };

  const runTestsButton = document.createElement("button");
  runTestsButton.textContent = "Run Tests Again";
  runTestsButton.style.cssText =
    "background: #4a90e2; border: none; color: white; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;";
  runTestsButton.onclick = function () {
    runAllSRMTests();
  };

  controls.appendChild(clearButton);
  controls.appendChild(runTestsButton);
  debugPanel.appendChild(controls);

  document.body.appendChild(debugPanel);
}

function debugLog(message, type = "info") {
  const content = document.getElementById("debug-content");
  if (!content) return;

  const entry = document.createElement("div");
  entry.style.cssText =
    "margin: 2px 0; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.05); white-space: pre-wrap; word-wrap: break-word;";

  let color = "#ffffff";
  let prefix = "";
  switch (type) {
    case "pass":
      color = "#4caf50";
      prefix = "✅ ";
      break;
    case "fail":
      color = "#f44336";
      prefix = "❌ ";
      break;
    case "header":
      color = "#ffeb3b";
      prefix = "▶️ ";
      entry.style.fontWeight = "bold";
      entry.style.paddingTop = "5px";
      break;
    case "summary":
      color = "#2196f3";
      prefix = "📊 ";
      entry.style.fontWeight = "bold";
      entry.style.marginTop = "8px";
      break;
    case "detail":
      color = "#bdbdbd";
      prefix = "  ";
      entry.style.fontSize = "11px";
      break;
    case "error":
      color = "#ff9800";
      prefix = "⚠️ ";
      break;
  }

  entry.style.color = color;
  entry.textContent = prefix + message;
  content.appendChild(entry);

  // Auto-scroll.
  requestAnimationFrame(() => {
    content.scrollTop = content.scrollHeight;
  });
}

// Baseline generated with Python's scipy's stats.
const srmTestCases = [
  {
    "name": "Equal 50:50 split - no mismatch",
    "observed": [
      1000,
      1000
    ],
    "expectedRatios": null,
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "Equal split w/ small variation",
    "observed": [
      1020,
      980
    ],
    "expectedRatios": null,
    "expectedChiSquare": 0.8,
    "expectedPValue": 0.37109336952269756
  },
  {
    "name": "Equal split w/ significant mismatch",
    "observed": [
      1200,
      800
    ],
    "expectedRatios": null,
    "expectedChiSquare": 80.0,
    "expectedPValue": 0.0
  },
  {
    "name": "Custom ratio 60:40 - correct distribution",
    "observed": [
      600,
      400
    ],
    "expectedRatios": [
      60,
      40
    ],
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "Custom ratio 70:30 w/ small mismatch",
    "observed": [
      650,
      350
    ],
    "expectedRatios": [
      70,
      30
    ],
    "expectedChiSquare": 11.904761904761905,
    "expectedPValue": 0.0005599062480061701
  },
  {
    "name": "Three equal variants",
    "observed": [
      333,
      333,
      334
    ],
    "expectedRatios": null,
    "expectedChiSquare": 0.002,
    "expectedPValue": 0.999000499833375
  },
  {
    "name": "Three variants w/ custom ratio 5:3:2",
    "observed": [
      500,
      300,
      200
    ],
    "expectedRatios": [
      5,
      3,
      2
    ],
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "Four equal variants w/ mismatch",
    "observed": [
      400,
      350,
      300,
      200
    ],
    "expectedRatios": null,
    "expectedChiSquare": 70.0,
    "expectedPValue": 4.218847493575595e-15
  },
  {
    "name": "Large numbers - equal split",
    "observed": [
      10000,
      10100
    ],
    "expectedRatios": null,
    "expectedChiSquare": 0.4975124378109453,
    "expectedPValue": 0.4805951793536507
  },
  {
    "name": "Small counts - equal split",
    "observed": [
      10,
      5
    ],
    "expectedRatios": null,
    "expectedChiSquare": 1.6666666666666667,
    "expectedPValue": 0.19670560245894686
  },
  {
    "name": "Realistic a/b test w/ equal split",
    "observed": [
      9532,
      9437
    ],
    "expectedRatios": [
      50,
      50
    ],
    "expectedChiSquare": 0.47577626654014443,
    "expectedPValue": 0.4903417490858071
  },
  {
    "name": "Extreme mismatch in equal split",
    "observed": [
      1000,
      100
    ],
    "expectedRatios": null,
    "expectedChiSquare": 736.3636363636364,
    "expectedPValue": 0.0
  },
  {
    "name": "Very large numbers - almost equal",
    "observed": [
      1000000,
      1000001
    ],
    "expectedRatios": null,
    "expectedChiSquare": 4.99999750000125e-07,
    "expectedPValue": 0.9994358106045154
  },
  {
    "name": "P-value threshold case (\u22480.05)",
    "observed": [
      1062,
      938
    ],
    "expectedRatios": null,
    "expectedChiSquare": 7.688,
    "expectedPValue": 0.005558919627070558
  },
  {
    "name": "P-value threshold case (\u22480.01)",
    "observed": [
      1082,
      918
    ],
    "expectedRatios": null,
    "expectedChiSquare": 13.448,
    "expectedPValue": 0.00024526750741094006
  },
  {
    "name": "Floating point ratios",
    "observed": [
      355,
      645
    ],
    "expectedRatios": [
      35.5,
      64.5
    ],
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "Many variants (10) - perfect match",
    "observed": [
      100,
      100,
      100,
      100,
      100,
      100,
      100,
      100,
      100,
      100
    ],
    "expectedRatios": null,
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "Many variants (10) - one outlier",
    "observed": [
      100,
      100,
      100,
      100,
      100,
      100,
      100,
      100,
      100,
      150
    ],
    "expectedRatios": null,
    "expectedChiSquare": 21.428571428571427,
    "expectedPValue": 0.010877592063108454
  },
  {
    "name": "Highly uneven custom ratio (99:1)",
    "observed": [
      990,
      10
    ],
    "expectedRatios": [
      99,
      1
    ],
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "Huge discrepancy - matching ratio",
    "observed": [
      9900,
      100
    ],
    "expectedRatios": [
      99,
      1
    ],
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "Complex fractional ratios",
    "observed": [
      1733,
      2644,
      623
    ],
    "expectedRatios": [
      0.3333333333333333,
      0.5,
      0.16666666666666666
    ],
    "expectedChiSquare": 64.02259999999995,
    "expectedPValue": 1.2545520178264269e-14
  },
  {
    "name": "Extreme SRM (tiny p-value)",
    "observed": [
      5000,
      100
    ],
    "expectedRatios": null,
    "expectedChiSquare": 4707.843137254902,
    "expectedPValue": 0.0
  },
  {
    "name": "Prime number observations",
    "observed": [
      101,
      103,
      107,
      109,
      113
    ],
    "expectedRatios": null,
    "expectedChiSquare": 0.8555347091932458,
    "expectedPValue": 0.9308515925586043
  },
  {
    "name": "Near max_safe_integer test",
    "observed": [
      100000000000000,
      100000000001000
    ],
    "expectedRatios": null,
    "expectedChiSquare": 4.999999999975e-09,
    "expectedPValue": 0.9999435810416923
  },
  {
    "name": "Perfect match w/ unusual ratio (3:7)",
    "observed": [
      300,
      700
    ],
    "expectedRatios": [
      3,
      7
    ],
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "Decimal observations",
    "observed": [
      100.5,
      99.5
    ],
    "expectedRatios": null,
    "expectedChiSquare": 0.005,
    "expectedPValue": 0.9436280222029834
  },
  {
    "name": "Extreme magnitude differences",
    "observed": [
      10,
      1000000
    ],
    "expectedRatios": null,
    "expectedChiSquare": 999970.000399996,
    "expectedPValue": 0.0
  },
  {
    "name": "Near-zero observation in equal split",
    "observed": [
      1000,
      1000,
      1000,
      1000,
      1
    ],
    "expectedRatios": null,
    "expectedChiSquare": 997.7515621094726,
    "expectedPValue": 0.0
  },
  {
    "name": "Perfect match w/ p-value = 1",
    "observed": [
      1000,
      1000,
      1000
    ],
    "expectedRatios": null,
    "expectedChiSquare": 0.0,
    "expectedPValue": 1.0
  },
  {
    "name": "High precision test w/ tiny difference",
    "observed": [
      10001,
      10000
    ],
    "expectedRatios": null,
    "expectedChiSquare": 4.999750012499375e-05,
    "expectedPValue": 0.9943582922185493
  },
];

function runSRMTest(testCase) {
  debugLog(`Running test: ${testCase.name}`, "header");
  debugLog(`  Observed: [${testCase.observed.join(", ")}]`, "detail");
  debugLog(
    `  Ratios: ${
      testCase.expectedRatios
        ? "[" + testCase.expectedRatios.join(", ") + "]"
        : "Equal Split"
    }`,
    "detail"
  );

  try {
    if (typeof performSRMCalculation !== "function") {
      throw new Error("performSRMCalculation is not available.");
    }

    const result = performSRMCalculation(
      testCase.observed,
      testCase.expectedRatios
    );

    debugLog(
      `  Expected χ²: ${testCase.expectedChiSquare.toFixed(
        6
      )}, Got: ${result.chiSquare.toFixed(6)}`,
      "detail"
    );
    debugLog(
      `  Expected p: ${testCase.expectedPValue.toFixed(
        8
      )}, Got: ${result.pValue.toFixed(8)}`,
      "detail"
    );

    const chiSquarePass = areClose(
      result.chiSquare,
      testCase.expectedChiSquare,
    );
    const pValuePass = areClose(
      result.pValue,
      testCase.expectedPValue,
    );

    if (chiSquarePass && pValuePass) {
      debugLog(`Test Passed`, "pass");
      passedTests++;
      return true;
    } else {
      let failureReason = [];
      if (!chiSquarePass)
        failureReason.push(
          `χ² mismatch (Exp: ${testCase.expectedChiSquare}, Got: ${result.chiSquare})`
        );
      if (!pValuePass)
        failureReason.push(
          `p-value mismatch (Exp: ${testCase.expectedPValue}, Got: ${result.pValue})`
        );
      debugLog(`Test Failed: ${failureReason.join(", ")}`, "fail");
      failedTests++;
      failedTestDetails.push({
        name: testCase.name,
        reason: failureReason.join(", "),
      });
      return false;
    }
  } catch (error) {
    debugLog(`Test Error: ${error.message}`, "error");
    console.error(`Error in test case '${testCase.name}':`, error);
    failedTests++;
    failedTestDetails.push({
      name: testCase.name,
      reason: `Execution Error: ${error.message}`,
    });
    return false;
  }
}

function runAllSRMTests() {
  const content = document.getElementById("debug-content");
  if (content) content.innerHTML = "";

  debugLog("Running all SRM tests…", "header");
  passedTests = 0;
  failedTests = 0;
  failedTestDetails = [];

  for (const testCase of srmTestCases) {
    runSRMTest(testCase);
  }

  const totalTests = srmTestCases.length;
  const passRate =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  debugLog(
    `Summary: ${passedTests}/${totalTests} tests passed (${passRate}%)`,
    "summary"
  );

  if (failedTests === 0) {
    debugLog("All tests passed! 🎉", "pass");
  } else {
    debugLog(`${failedTests} tests failed:`, "fail");
    failedTestDetails.forEach((failure, index) => {
      debugLog(`  ${index + 1}. ${failure.name} - ${failure.reason}`, "fail");
    });
  }
}

function initSRMTests() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("test")) {
    if (!document.getElementById("debug-panel")) {
      createDebugPanel();
    }
    setTimeout(runAllSRMTests, 100);
  } else {
    console.log("URL does not contain '?test'. Skipping tests.");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSRMTests);
} else {
  initSRMTests();
}
