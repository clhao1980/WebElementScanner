package com.ibm.webElementsScanner;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.DOMReader;
import org.jsoup.Jsoup;
import org.jsoup.helper.W3CDom;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class JsoupAndDom4j {

    public static void main(String[] args) throws IOException {
//		String htmlUrl = "http://9.111.221.116:8080/CTAP/app/#/login";
//		Document document = Jsoup.connect(htmlUrl).get();	//��URLֱ�Ӽ���html�ĵ�
//		File file = new File("edulogin.htm");
        File file = new File("login.html");
        //������jsoup��documentת����w3c��document
        W3CDom w3cDom = new W3CDom();

        //Dome4j��reader
        DOMReader domReader = new DOMReader();
        //Dome4j��document
        Document document = null;


        try {
            document = domReader.read(w3cDom.fromJsoup(Jsoup.parse(file, "UTF-8")));
            //dome4j's element
            Element root = document.getRootElement();

//			System.out.println(root.getUniquePath());
            //���<xpath,value>��
            Map<String, String> map = new HashMap<String, String>();
            //���element��list
            List<Element> elementList = new ArrayList<Element>();
            //�����е�Ԫ�ش�������
            getAllElements(root, elementList);
            //����dom���Ҵ���map
//            dom2XpathMap(root, map);
//            System.out.println(map.size());
//            for (String key : map.keySet()) {
//                System.out.println(key + ":" + map.get(key));
//            }
            for (Element e :
                    elementList) {
//                printElement(e);
                String tag = e.getName().trim();
                String stringValue = e.getText().trim();
                String xpath = e.getUniquePath().trim();

                if (stringValue.equals("")) {
                    //���ֵܽڵ��в���������Ϣ
                    Iterator<Element> iterator = e.getParent().elementIterator();
                    while (iterator.hasNext()) {
                        Element el = iterator.next();
                        String elXpath = el.getUniquePath().trim();
                        String elTag = el.getName().trim();
                        String elStringValue = el.getText().trim();
                        if (!elStringValue.equals("") && !xpath.equals(elXpath) && subXpath(xpath).equals(subXpath(elXpath))) {
                            System.out.println("xpath is : " + xpath);
                            System.out.println(elTag + " is " + elStringValue);
                            System.out.println();
                        }
                    }

                } else {
                    System.out.println("xpath is : " + xpath);
                    System.out.println(tag + " is " + stringValue);
                    System.out.println();
                }
//                System.out.println(e.getUniquePath() + " : " + e.getText());
            }

        } catch (IOException e) {
            System.out.println("something wrong with IO");
            e.printStackTrace();
        }
        //��ӡhtml
//        System.out.println(Jsoup.parse(file, "UTF-8"));
    }

    private static String subXpath(String xpath, String tag) {
        return xpath.substring(0, xpath.indexOf(tag));
    }

    private static String subXpath(String xpath) {
        return xpath.substring(0, xpath.lastIndexOf("/"));
    }


    private static void getAllElements(Element root, List<Element> list) {
        if (root == null || root.isTextOnly()) {
            list.add(root);
            return;
        }
        Iterator<Element> iterator = root.elementIterator();
        while (iterator.hasNext()) {
            Element el = iterator.next();
            getAllElements(el, list);

        }

    }

    private static void dom2XpathMap(Element root, Map<String, String> map) {
        //
        if (root == null || root.isTextOnly()) {
            if (root.getText() != null && !root.getText().equals("")) {
                String xpath = root.getUniquePath().toLowerCase();
                String value = root.getText();
                if (xpath.contains("body")) {
                    map.put(xpath, value);
                    System.out.println(xpath + ":" + value);

                }
            } else {
                String xpath = root.getUniquePath().toLowerCase();
                if (xpath.contains("body")) {
                    map.put(xpath, "no text");
                    System.out.println(xpath + ":" + root.getName());
                }
            }
            if (map.containsKey(root.getUniquePath())) {
                //System.out.println("map contains key : " +root.getUniquePath());
            }
            return;
        }
        Iterator<Element> iterator = root.elementIterator();
        while (iterator.hasNext()) {
            Element el = iterator.next();
            dom2XpathMap(el, map);
        }

    }

    private static void printElement(Element e) {
//        System.out.println("getNodeTypeName() is : " + e.getNodeTypeName());
        System.out.println("getText() is : " + e.getText());
//        System.out.println("getXPathNameStep() is : " + e.getNamespace().getXPathNameStep());
        System.out.println("getName() is :" + e.getName());
//        System.out.println("getQualifiedName() is :" + e.getQualifiedName());
//        System.out.println("getQName().getName() is :" + e.getQName().getName());
//        System.out.println("getData() is :" + e.getData());
//        System.out.println("getPath() : " + e.getPath());
//        System.out.println("getStringValue() is :" + e.getStringValue());//�����ȡ��������,������getText()
        System.out.println("getUniquePath() is :" + e.getUniquePath());
        System.out.println();
    }

    static class Xpath {
        private String xpath;
        private String value;
    }


}
