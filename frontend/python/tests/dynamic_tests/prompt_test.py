from selenium.webdriver.common.by import By
from driver import init_driver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# function to make sure AI model is up
def test_prompt_functionality():
    driver = init_driver()

    try:
        driver.get("http://localhost/")
        driver.execute_script("localStorage.setItem('user', 'test')")
        driver.implicitly_wait(1)

        # navigate to login page
        nav_bar_login = driver.find_element(by=By.CLASS_NAME, value="nav-bar-login")
        nav_bar_login.find_elements(by=By.CLASS_NAME, value="nav-account")[0].click()
        driver.implicitly_wait(1)
        
        # login with test account
        emailInput = driver.find_element(by=By.ID, value="email")
        passwordInput = driver.find_element(by=By.ID, value="password")
        emailInput.send_keys("bookshelf.ai.official@gmail.com")
        passwordInput.send_keys("testpassword")
        driver.execute_async_script("document.getElementById('confirmLogin').click()")
        
        time.sleep(1)
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        time.sleep(2)
        driver.switch_to.alert.accept()

        # test to see if jwt is stored in localstorage
        test1 = driver.execute_script("return localStorage.getItem('jwt')") != None

        # navigate to search page
        time.sleep(3)
        nav_bar_main = driver.find_element(by=By.CLASS_NAME, value="nav-bar-main")
        nav_bar_main.find_elements(by=By.CLASS_NAME, value="nav-btn")[3].click()
        test2 = driver.current_url == "http://localhost/search/"

        # enter a text prompt
        promptInput = driver.find_element(by=By.ID, value="prompt")
        promptInput.send_keys("Books by JK Rowling")
        driver.execute_async_script("document.getElementById('prompt-button').click()")

        # accept the alert
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        time.sleep(1)
        driver.switch_to.alert.accept()

        # wait for model to prompt
        time.sleep(10)
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        time.sleep(1)
        driver.switch_to.alert.accept()

        # check if there are at least 3 books in the results
        time.sleep(2)
        test3 = len(driver.find_elements(by=By.CLASS_NAME, value="book")) >= 3

        # add the first one
        bookId = driver.find_elements(by=By.CLASS_NAME, value="book")[0].get_attribute("id")
        driver.execute_script(f"document.getElementById({bookId}).getElementsByClassName('add')[0].click()")

        # navigate to bookshelf page
        time.sleep(1)
        nav_bar_main = driver.find_element(by=By.CLASS_NAME, value="nav-bar-main")
        nav_bar_main.find_elements(by=By.CLASS_NAME, value="nav-btn")[4].click()
        time.sleep(1)

        # check if there are 3 books in the bookshelf
        test4 = len(driver.find_elements(by=By.CLASS_NAME, value="book")) == 3

        # delete the book we just added with bookid
        driver.execute_script(f"document.getElementById('{bookId}').getElementsByClassName('delete')[0].click()")
        time.sleep(1)

        # check if there are 2 books in the bookshelf
        test5 = len(driver.find_elements(by=By.CLASS_NAME, value="book")) == 2

        assert test1 and test2 and test3 and test4 and test5
    finally:
        driver.quit()


