from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

# function to generate a webdriver
def init_driver():
    # setup options
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--incognito") 
    options.add_argument("--disable-popup-blocking")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    driver = webdriver.Chrome(
        options=options,
    )

    return driver
