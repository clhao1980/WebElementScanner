package com.ibm.webElementsScanner;

/**
 * Created by huangning on 2018/4/2.
 */
public class Demo {
    public static void main(String[] args) {
        String inputXpath = "/html/body/div/div[2]/div[2]/div[2]/div/input";
        String labelXpath = "/html/body/div/div[2]/div[2]/div[3]/div/label";
        System.out.println(inputXpath.substring(0, inputXpath.lastIndexOf("/")));
    }
}
