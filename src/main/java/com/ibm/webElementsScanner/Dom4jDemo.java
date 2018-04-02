package com.ibm.webElementsScanner;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.cyberneko.html.parsers.DOMParser;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.DOMReader;
//import org.w3c.dom.Document;
//import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class Dom4jDemo {

	public static void main(String[] args) {
		Dom4jDemo scannerDemo = new Dom4jDemo();
		
		String htmlUrl = "http://9.111.221.116:8080/CTAP/app/#/login";
		String content = scannerDemo.getHtmlContent(htmlUrl).toString();
		System.out.println(content);
		//cyberneko的DOMParser
		DOMParser parser = new DOMParser();
		//Dome4j的reader
		DOMReader domReader = new DOMReader();
		//Dome4j的document
		Document document = null;
		try {
//			parser.parse(new InputSource(new ByteArrayInputStream(content.getBytes("UTF-8"))));
			parser.parse(new InputSource(new FileInputStream("C:/WebElementsScanner/login.html")));
			document = domReader.read(parser.getDocument());
			//dome4j's element
			Element root = document.getRootElement();
			System.out.println(root.getUniquePath());
			Map<String, String> map =new ConcurrentHashMap<String, String>();
			//解析dom并且存入map
			dom2XpathMap(root, map);
			System.out.println(map.size());
			for(String key : map.keySet()){
				System.out.println(key + ":" +map.get(key));
			}
			
			
		} catch (SAXException e) {
			System.out.println("something wrong with SAX");
			e.printStackTrace();
		} catch (IOException e) {
			System.out.println("something wrong with IO");
			e.printStackTrace();
		}

	}
	
	private static void dom2XpathMap(Element root, Map<String, String> map){
		//
		if(root == null || root.isTextOnly()){
			if(!root.getText().equals("") && root.getText() != null){
				map.put(root.getUniquePath(), root.getText());
				System.out.println(root.getUniquePath().toLowerCase() + " now put key");
			}else{
				System.out.println(root.getUniquePath().toLowerCase() + " now put key");
				map.put(root.getUniquePath(), "no text");
			}
			if(map.containsKey(root.getUniquePath())){
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
	
	public String getHtmlContent(String htmlUrl){
		String temp;
		StringBuffer sbuffer = new StringBuffer();
		try {
			URL url = new URL(htmlUrl);
			try {
				BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream(), "UTF-8"));
				
				while((temp = in.readLine()) != null){
					sbuffer.append(temp);
					}
				in.close();
			} catch (UnsupportedEncodingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		
		} catch (MalformedURLException e) {
			System.out.println("输入的URL格式有误");
			e.printStackTrace();
		}
		return sbuffer.toString();
		
	}
	

}
