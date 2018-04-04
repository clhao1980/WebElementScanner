package com.ibm.webElementsScanner;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.dom4j.Attribute;
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
//		Document document = Jsoup.connect(htmlUrl).get();	//从URL直接加载html文档
//		File file = new File("edulogin.htm");
        File file = new File("testPage/ipwc_home.html");
        //用来将jsoup的document转换成w3c的document
        W3CDom w3cDom = new W3CDom();

        //Dome4j的reader
        DOMReader domReader = new DOMReader();
        //Dome4j的document
        Document document = null;


        try {
            document = domReader.read(w3cDom.fromJsoup(Jsoup.parse(file, "UTF-8")));
            //dome4j's element
            Element root = document.getRootElement();
            //存放<xpath,value>对
            Map<String, String> map = new HashMap<String, String>();
            //存放element的list
            List<Element> elementList = new ArrayList<Element>();
            //将所有的元素存入链表
            getAllElements(root, elementList);

            for (Element e :
                elementList) {
            	printElement(e);
            	
            }
            for (Element e :
                    elementList) {

                String tag = e.getName().trim();
                String stringValue = e.getText().trim();
                String xpath = e.getUniquePath().trim();
                
            	if(!xpath.toLowerCase().contains("body")){
            		return;
            	}

                if (stringValue.equals("")) {
                    //从兄弟节点中查找有用信息
                    Iterator<Element> iterator = e.getParent().elementIterator();
                    while (iterator.hasNext()) {
                        Element el = iterator.next();
                        String elXpath = el.getUniquePath().trim();
                        String elTag = el.getName().trim();
                        String elStringValue = el.getText().trim();
                        if (!elStringValue.equals("") && !xpath.equals(elXpath) && subXpathByLastIndex(xpath,"/").equals(subXpathByLastIndex(elXpath,"/"))) {
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
        //打印html
//        System.out.println(Jsoup.parse(file, "UTF-8"));
    }

    private static String subXpathByIndex(String xpath, String tag) {
        return xpath.substring(0, xpath.indexOf(tag));
    }

    private static String subXpathByLastIndex(String xpath, String tag) {
        return xpath.substring(0, xpath.lastIndexOf(tag));
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
    	//
//        System.out.println("getNodeTypeName() is : " + e.getNodeTypeName());
//        System.out.println("getXPathNameStep() is : " + e.getNamespace().getXPathNameStep());
//        System.out.println("getQualifiedName() is :" + e.getQualifiedName());
//        System.out.println("getQName().getName() is :" + e.getQName().getName());
//        System.out.println("getData() is :" + e.getData());
//        System.out.println("getPath() : " + e.getPath());
//        System.out.println("getStringValue() is :" + e.getStringValue());//这个获取的有问题,还是用getText()
    	if(!e.getUniquePath().toLowerCase().contains("body")){
    		return;
    	}
    	Iterator iterator  = e.attributeIterator();
    	System.out.println("attributes{");
        while(iterator.hasNext()){
        	Attribute attribute = (Attribute) iterator.next();
        	System.out.println( attribute.getName() + " : " + attribute.getText());
        }
        System.out.println("}");
        System.out.println("getText() is : " + e.getText().trim());
        System.out.println("getName() is :" + e.getName().trim());
        System.out.println("getUniquePath() is :" + e.getUniquePath());
        System.out.println();
    }

    static class Xpath {
        private String xpath;
        private String value;
    }


}
