package com.ibm.webElementsScanner;

import java.io.File;
import java.io.IOException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class JsoupDemo {

	public static void main(String[] args) throws IOException {
//		String htmlUrl = "http://9.111.221.116:8080/CTAP/app/#/login";
//		String htmlUrl = "https://github.ibm.com/codeblue/collaborative-test-automation-platform/tree/develop";
		String htmlUrl = "http://localhost:8080/education/#/login";
		Document document = Jsoup.connect(htmlUrl).get();	//从URL直接加载html文档
//		File file = new File("C:/WebElementsScanner/login.html");
//		Document document = Jsoup.parse(file, "UTF-8");
		
		Elements content = document.getAllElements();
		Elements rootBody = document.getElementsByTag("div");
		for(Element e:rootBody){
			
			System.out.println(e.cssSelector() + " : "+ e.data() + " : " + e.ownText() );
		}
		
		System.out.println("8888888888888888888888888888888");
		
		System.out.println(document.toString());
	}

}
