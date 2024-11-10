from selenium.webdriver.common.by import By
from driver import init_driver

# function to make sure about page is visually functional
def test_about_visual():
    driver = init_driver()

    try:
        driver.get("http://localhost/about/")
        driver.implicitly_wait(1)

        # test to check if there are errors in console
        test1 = len([log for log in driver.get_log("browser") if (log["level"] != "INFO") and (log["level"] != "DEBUG") and (log["level"] != "LOG")]) == 0

        # test to see if navbar title exists and is rendered properly
        nav_title = driver.find_element(by=By.CLASS_NAME, value="nav-title")
        test2 = nav_title != None and nav_title.is_displayed() and nav_title.value_of_css_property("font-family") == "\"Inknut Antiqua\", system-ui"

        # test to see if about introduction div exists
        about_intro = driver.find_element(by=By.CLASS_NAME, value="about-introduction")
        test3 = about_intro != None and about_intro.is_displayed()

        # test to see if about team div exists
        about_team = driver.find_element(by=By.CLASS_NAME, value="about-team")
        test4 = about_team != None and about_team.is_displayed()

        # test to see if footer exists and is rendered properly
        footer = driver.find_element(by=By.CLASS_NAME, value="footer")
        test5 = footer != None and footer.is_displayed() and footer.value_of_css_property("height") == "120px"

        # test to see if github icon in footer is rendered properly
        github_icon = driver.find_element(by=By.CLASS_NAME, value="footer-github-icon")
        test6 = github_icon != None and github_icon.is_displayed() and github_icon.get_attribute("width").isdigit() and int(github_icon.get_attribute("width")) > 0

        assert test1 and test2 and test3 and test4 and test5 and test6
    finally:
        driver.quit()


