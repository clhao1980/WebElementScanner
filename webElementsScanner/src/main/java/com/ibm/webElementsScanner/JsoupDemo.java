package com.ibm.webElementsScanner;

import java.io.IOException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class JsoupDemo {

	public static void main(String[] args) throws IOException {
		String htmlUrl = "http://9.111.221.116:8080/CTAP/app/#/login";
		Document document = Jsoup.connect(htmlUrl).get();
		
		Elements content = document.getAllElements();
		for(Element e:content){
			
		}
		
		System.out.println(document.toString());
	}

}
