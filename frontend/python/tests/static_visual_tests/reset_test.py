from selenium.webdriver.common.by import By
from driver import init_driver

# function to make sure password reset page is visually functional
def test_reset_visual():
    driver = init_driver()

    try:
        driver.get("http://localhost/resetpassword/")
        driver.implicitly_wait(1)

        # test to check if there are errors in console
        test1 = len([log for log in driver.get_log("browser") if (log["level"] != "INFO") and (log["level"] != "DEBUG") and (log["level"] != "LOG")]) == 0

        # test to see if background exists and is rendered properly
        background = driver.find_element(by=By.CLASS_NAME, value="background")
        test2 = background != None and background.is_displayed() and background.value_of_css_property("background-image") == "url(\"http://localhost/res/home-background1.jpg\")"

        # test to see if email input exists
        email_input = driver.find_element(by=By.ID, value="email")
        test3 = email_input != None and email_input.is_displayed()

        # test to see if password input exists
        password_input = driver.find_element(by=By.ID, value="password")
        test4 = password_input != None and password_input.is_displayed()

        # test to see if footer exists and is rendered properly
        footer = driver.find_element(by=By.CLASS_NAME, value="footer")
        test5 = footer != None and footer.is_displayed() and footer.value_of_css_property("height") == "120px"

        # test to see if github icon in footer is rendered properly
        github_icon = driver.find_element(by=By.CLASS_NAME, value="footer-github-icon")
        test6 = github_icon != None and github_icon.is_displayed() and github_icon.get_attribute("width").isdigit() and int(github_icon.get_attribute("width")) > 0

        # test to see if get reset code button is rendered properly
        reset_code = driver.find_element(by=By.ID, value="getEmailCode")
        test7 = reset_code != None and reset_code.is_displayed() and reset_code.value_of_css_property("font-family") == "\"Afacad Flux\", system-ui"

        assert test1 and test2 and test3 and test4 and test5 and test6 and test7
    finally:
        driver.quit()
