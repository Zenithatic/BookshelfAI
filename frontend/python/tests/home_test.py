from selenium.webdriver.common.by import By
from driver import init_driver

# function to make sure home page is visually functional
def test_home_visual():
    driver = init_driver()

    try:
        driver.get("http://localhost:80")
        driver.implicitly_wait(1)

        # test to check if there are errors in console
        test1 = len([log for log in driver.get_log("browser") if (log["level"] != "INFO") and (log["level"] != "DEBUG") and (log["level"] != "LOG")]) == 0

        # test to see if navbar title exists and is rendered properly
        nav_title = driver.find_element(by=By.CLASS_NAME, value="nav-title")
        test2 = nav_title != None and nav_title.is_displayed() and nav_title.value_of_css_property("font-family") == "\"Inknut Antiqua\", system-ui"

        # test to see if title exists and is rendered properly
        main_title = driver.find_element(by=By.CLASS_NAME, value="home-welcome-title")
        test3 = main_title != None and main_title.is_displayed() and main_title.value_of_css_property("font-family") == "\"Inknut Antiqua\", system-ui"

        # test to see if title icon exists and is rendered properly
        title_icon = driver.find_element(by=By.CLASS_NAME, value="home-welcome-icon")
        test4 = title_icon != None and title_icon.is_displayed() and title_icon.get_attribute("width").isdigit() and int(title_icon.get_attribute("width")) > 0

        # test to see if footer exists and is rendered properly
        footer = driver.find_element(by=By.CLASS_NAME, value="footer")
        test5 = footer != None and footer.is_displayed() and footer.value_of_css_property("height") == "120px"

        # test to see if github icon in footer is rendered properly
        github_icon = driver.find_element(by=By.CLASS_NAME, value="footer-github-icon")
        test6 = github_icon != None and github_icon.is_displayed() and github_icon.get_attribute("width").isdigit() and int(github_icon.get_attribute("width")) > 0

        assert test1 and test2 and test3 and test4 and test5 and test6
    finally:
        driver.quit()

# function to make sure nav bar is working on home page
def test_home_nav():
    driver = init_driver()
    try:
        driver.get("http://localhost:80")
        driver.implicitly_wait(1)
        
        # button to make sure 

        # test to make sure navigation to about page works
    finally:
        driver.quit()
