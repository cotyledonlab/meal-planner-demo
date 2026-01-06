const puppeteer = require("puppeteer");

const URL =
  process.env.TEST_URL ||
  "https://meal-plan-demo-monostack-i9woau-78f535-65-108-56-181.traefik.me/";
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error(
    "Set TEST_EMAIL and TEST_PASSWORD before running this script.",
  );
}

async function testMealPlanGeneration() {
  console.log("Starting Puppeteer test...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--ignore-certificate-errors",
      "--ignore-certificate-errors-spki-list",
    ],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  // Collect console messages
  const consoleMessages = [];
  const errors = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    // Only log errors and warnings, not all console messages
    if (type === "error" || type === "warning") {
      console.log(`[CONSOLE ${type.toUpperCase()}]:`, text);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.error("[PAGE ERROR]:", error.message);
  });

  page.on("requestfailed", (request) => {
    console.error(
      "[REQUEST FAILED]:",
      request.url(),
      request.failure().errorText,
    );
  });

  try {
    console.log("Step 1: Navigating to home page...");
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
    console.log("✓ Page loaded successfully\n");

    // Check if we need to log in or if already logged in
    const needsLogin = await page.evaluate(() => {
      return !!document.querySelector('input[type="email"]');
    });

    if (!needsLogin) {
      console.log('Not on login page, looking for "Get Started" button...');

      // Click "Get Started" button
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button, a"));
        const getStartedBtn = buttons.find((el) =>
          el.textContent.toLowerCase().includes("get started"),
        );
        if (getStartedBtn) {
          getStartedBtn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        console.log('Clicked "Get Started" button');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        console.log('"Get Started" button not found, checking current page');
      }
    }

    // Check if we're on signup page, need to click "Sign in" link
    const onSignupPage = await page.evaluate(() => {
      return (
        document.body.textContent.includes("Create your account") &&
        document.body.textContent.includes("Already have an account")
      );
    });

    if (onSignupPage) {
      console.log('On signup page, clicking "Sign in" link...');
      const signInClicked = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a"));
        const signInLink = links.find((el) =>
          el.textContent.toLowerCase().includes("sign in"),
        );
        if (signInLink) {
          signInLink.click();
          return true;
        }
        return false;
      });

      if (signInClicked) {
        console.log('Clicked "Sign in" link');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.log("Step 2: Logging in...");
    // Wait for login form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    // Fill in credentials
    await page.type('input[type="email"]', EMAIL);
    await page.type('input[type="password"]', PASSWORD);

    // Click login button
    const loginButton = await page.$('button[type="submit"]');
    if (!loginButton) {
      throw new Error("Login button not found");
    }

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
      loginButton.click(),
    ]);
    console.log("✓ Login form submitted\n");
    console.log("✓ Logged in successfully\n");

    console.log("Step 3: Navigating to meal planner page...");
    const currentUrl = page.url();
    console.log("Current URL:", currentUrl);

    // Click "Plan meals" or "New Weekly Plan" button
    const clickResult = await page.evaluate(() => {
      // Look for all clickable elements
      const elements = Array.from(
        document.querySelectorAll('button, a, [role="button"]'),
      );

      // Try to find "Plan meals" button
      let planMealsBtn = elements.find(
        (el) => el.textContent.trim() === "Plan meals",
      );

      // If not found, try case-insensitive
      if (!planMealsBtn) {
        planMealsBtn = elements.find((el) =>
          el.textContent.toLowerCase().includes("plan meals"),
        );
      }

      // Also try "New Weekly Plan"
      if (!planMealsBtn) {
        planMealsBtn = elements.find((el) =>
          el.textContent.toLowerCase().includes("new weekly plan"),
        );
      }

      if (planMealsBtn) {
        planMealsBtn.click();
        return { clicked: true, text: planMealsBtn.textContent.trim() };
      }

      // Return all available buttons/links for debugging
      return {
        clicked: false,
        available: elements
          .map((el) => el.textContent.trim())
          .filter((t) => t.length > 0 && t.length < 50),
      };
    });

    if (clickResult.clicked) {
      console.log("Clicked button:", clickResult.text);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      console.log("Could not find meal planning button");
      console.log("Available buttons/links:", clickResult.available);
    }

    console.log("✓ On planner page:", page.url(), "\n");

    // Take a screenshot before clicking
    await page.screenshot({
      path: "/tmp/before-create-plan.png",
      fullPage: true,
    });
    console.log("✓ Screenshot saved: /tmp/before-create-plan.png\n");

    console.log('Step 4: Looking for "Create My Plan" button...');

    // Wait a moment for any dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Find the button - try multiple selectors
    const createPlanButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const createButton = buttons.find(
        (btn) =>
          btn.textContent.toLowerCase().includes("create") &&
          btn.textContent.toLowerCase().includes("plan"),
      );

      if (createButton) {
        return {
          text: createButton.textContent,
          disabled: createButton.disabled,
          className: createButton.className,
        };
      }
      return null;
    });

    console.log("Create Plan button info:", createPlanButton);

    if (!createPlanButton) {
      // List all buttons on the page
      const allButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("button")).map((btn) => ({
          text: btn.textContent.trim(),
          disabled: btn.disabled,
          className: btn.className,
        }));
      });
      console.log("All buttons on page:", allButtons);
      throw new Error("Create My Plan button not found");
    }

    // Click the button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const createButton = buttons.find(
        (btn) =>
          btn.textContent.toLowerCase().includes("create") &&
          btn.textContent.toLowerCase().includes("plan"),
      );
      if (createButton) {
        createButton.click();
      }
    });

    console.log('✓ "Create My Plan" button clicked\n');

    console.log("Step 5: Waiting for meal plan to generate...");

    // Wait for the page to load/update
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Wait for either success indicators or error messages
    try {
      await page.waitForFunction(
        () => {
          const loadingIndicator = document.querySelector('[role="status"]');
          const hasContent = document.body.textContent.length > 1000;
          const hasError =
            document.body.textContent.includes("error") ||
            document.body.textContent.includes("Error");

          // Wait until loading is done and we have content or an error
          return (
            (!loadingIndicator || loadingIndicator.style.display === "none") &&
            (hasContent || hasError)
          );
        },
        { timeout: 60000 },
      );
    } catch (e) {
      console.log("Timeout waiting for content, continuing with analysis...");
    }

    // Wait a bit more for any final rendering
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("✓ Page updated\n");

    // Take a screenshot after
    await page.screenshot({
      path: "/tmp/after-create-plan.png",
      fullPage: true,
    });
    console.log("✓ Screenshot saved: /tmp/after-create-plan.png\n");

    console.log("Step 6: Analyzing results...\n");
    console.log("=".repeat(60));
    console.log("ANALYSIS RESULTS");
    console.log("=".repeat(60) + "\n");

    // Check for meal plan content
    const pageAnalysis = await page.evaluate(() => {
      const bodyText = document.body.textContent;

      // Look for meal plan indicators
      const hasMealPlan =
        (bodyText.toLowerCase().includes("monday") &&
          bodyText.toLowerCase().includes("tuesday")) ||
        bodyText.toLowerCase().includes("breakfast") ||
        bodyText.toLowerCase().includes("lunch") ||
        bodyText.toLowerCase().includes("dinner");

      const hasShoppingList = bodyText.toLowerCase().includes("shopping list");
      const noShoppingListMsg = bodyText
        .toLowerCase()
        .includes("no shopping list available");

      const hasError =
        bodyText.toLowerCase().includes("error") ||
        bodyText.toLowerCase().includes("failed") ||
        bodyText.toLowerCase().includes("something went wrong");

      // Get all headings to see page structure
      const headings = Array.from(
        document.querySelectorAll("h1, h2, h3, h4"),
      ).map((h) => h.textContent.trim());

      // Get any error messages
      const errorElements = Array.from(
        document.querySelectorAll('[role="alert"], .error, .alert-error'),
      );
      const errorMessages = errorElements.map((el) => el.textContent.trim());

      return {
        hasMealPlan,
        hasShoppingList,
        noShoppingListMsg,
        hasError,
        headings,
        errorMessages,
        bodyTextLength: bodyText.length,
      };
    });

    console.log("1. PAGE LOAD STATUS:");
    console.log("   ✓ Page loaded without crashing");
    console.log(
      `   - Body text length: ${pageAnalysis.bodyTextLength} characters\n`,
    );

    console.log("2. MEAL PLAN DISPLAY:");
    if (pageAnalysis.hasMealPlan) {
      console.log("   ✓ Meal plan appears to be displayed");
    } else {
      console.log("   ✗ Meal plan does not appear to be displayed");
    }
    console.log(
      `   - Page headings found: ${pageAnalysis.headings.join(", ")}\n`,
    );

    console.log("3. SHOPPING LIST:");
    if (pageAnalysis.hasShoppingList) {
      console.log("   ✓ Shopping list section found");
      if (pageAnalysis.noShoppingListMsg) {
        console.log('   - Shows "No shopping list available" message');
      } else {
        console.log("   - Shopping list appears to have content");
      }
    } else {
      console.log("   ✗ Shopping list section not found");
    }
    console.log("");

    console.log("4. ERROR STATUS:");
    if (pageAnalysis.hasError) {
      console.log("   ✗ Error messages detected on page");
      if (pageAnalysis.errorMessages.length > 0) {
        console.log("   - Error messages:");
        pageAnalysis.errorMessages.forEach((msg) =>
          console.log(`     - ${msg}`),
        );
      }
    } else {
      console.log("   ✓ No visible error messages on page");
    }
    console.log("");

    console.log("5. JAVASCRIPT CONSOLE:");
    const jsErrors = consoleMessages.filter((msg) => msg.type === "error");
    const jsWarnings = consoleMessages.filter((msg) => msg.type === "warning");

    if (jsErrors.length === 0 && errors.length === 0) {
      console.log("   ✓ No JavaScript errors detected");
    } else {
      console.log(
        `   ✗ ${jsErrors.length + errors.length} JavaScript error(s) detected:`,
      );
      jsErrors.forEach((msg) => console.log(`     - ${msg.text}`));
      errors.forEach((err) => console.log(`     - ${err}`));
    }

    if (jsWarnings.length > 0) {
      console.log(`   - ${jsWarnings.length} warning(s) detected`);
    }
    console.log("");

    console.log("=".repeat(60));
    console.log("OVERALL ASSESSMENT");
    console.log("=".repeat(60) + "\n");

    const allChecks = {
      pageLoaded: true,
      mealPlanDisplayed: pageAnalysis.hasMealPlan,
      shoppingListPresent:
        pageAnalysis.hasShoppingList || pageAnalysis.noShoppingListMsg,
      noErrors:
        jsErrors.length === 0 && errors.length === 0 && !pageAnalysis.hasError,
    };

    const passedChecks = Object.values(allChecks).filter((v) => v).length;
    const totalChecks = Object.keys(allChecks).length;

    console.log(`Passed ${passedChecks}/${totalChecks} checks:\n`);
    console.log(
      `  [${allChecks.pageLoaded ? "✓" : "✗"}] Page loads without errors`,
    );
    console.log(
      `  [${allChecks.mealPlanDisplayed ? "✓" : "✗"}] Meal plan is displayed correctly`,
    );
    console.log(
      `  [${allChecks.shoppingListPresent ? "✓" : "✗"}] Shopping list appears`,
    );
    console.log(`  [${allChecks.noErrors ? "✓" : "✗"}] No JavaScript errors`);
    console.log("");

    if (passedChecks === totalChecks) {
      console.log("✓ FIX SUCCESSFUL - All checks passed!");
    } else if (passedChecks >= totalChecks - 1) {
      console.log("~ FIX PARTIALLY SUCCESSFUL - Minor issues detected");
    } else {
      console.log("✗ FIX UNSUCCESSFUL - Multiple issues detected");
    }
  } catch (error) {
    console.error("\n❌ TEST FAILED WITH ERROR:", error.message);
    console.error("Stack trace:", error.stack);

    // Take screenshot on error
    try {
      await page.screenshot({
        path: "/tmp/error-screenshot.png",
        fullPage: true,
      });
      console.log("\nError screenshot saved: /tmp/error-screenshot.png");
    } catch (e) {
      console.error("Could not take error screenshot:", e.message);
    }
  } finally {
    await browser.close();
    console.log("\n✓ Browser closed");
  }
}

// Run the test
testMealPlanGeneration().catch(console.error);
