package com.ibm.webElementsScanner.getPageUtil;

import java.util.HashMap;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.NicelyResynchronizingAjaxController;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;

public class GetPageUtil {
	/**
	 * 请求超时时间,默认20000ms
	 */
	private int timeout = 20000;
	/**
	 * 等待异步JS执行时间,默认20000ms
	 */
	private int waitForBackgroundJavaScript = 20000;
	/**
	 * cookie表
	 */
	private Map<String, String> cookieMap = new HashMap<String,String>();

	/**
	 * 请求编码(处理返回结果)，默认UTF-8
	 */
	private String charset = "UTF-8";

	private static GetPageUtil getPageUtil;

	private GetPageUtil() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * 获取实例
	 *
	 * @return
	 */
	public static GetPageUtil getInstance() {
		if (getPageUtil == null)
			getPageUtil = new GetPageUtil();
		return getPageUtil;
	}

	/**
	 * 清空cookieMap
	 */
	public void invalidCookieMap() {
		cookieMap.clear();
	}

	public int getTimeout() {
		return timeout;
	}

	/**
	 * 设置请求超时时间
	 *
	 * @param timeout
	 */
	public void setTimeout(int timeout) {
		this.timeout = timeout;
	}

	public String getCharset() {
		return charset;
	}

	/**
	 * 设置请求字符编码集
	 *
	 * @param charset
	 */
	public void setCharset(String charset) {
		this.charset = charset;
	}

	public int getWaitForBackgroundJavaScript() {
		return waitForBackgroundJavaScript;
	}

	/**
	 * 设置获取完整HTML页面时等待异步JS执行的时间
	 *
	 * @param waitForBackgroundJavaScript
	 */
	public void setWaitForBackgroundJavaScript(int waitForBackgroundJavaScript) {
		this.waitForBackgroundJavaScript = waitForBackgroundJavaScript;
	}
	
	
	/**
	 * 将网页返回为解析后的文档格式
	 * 
	 * @param html
	 * @return
	 * @throws Exception
	 */
	public static Document parseHtmlToDoc(String html) throws Exception {
		return removeHtmlSpace(html);
	}
	
	/**
	 * 获取页面文档Document对象(等待异步JS执行)
	 *
	 * @param url 页面URL
	 * @return
	 * @throws Exception
	 */
	public Document getHtmlPageResponseAsDocument(String url) throws Exception {
		return parseHtmlToDoc(getHtmlPageResponse(url));
	}
	
	private static Document removeHtmlSpace(String str) {
		Document doc = Jsoup.parse(str);
		String result = doc.html().replace("&nbsp;", "");
		return Jsoup.parse(result);
	}
	
	/**
	 * 获取页面文档字串(等待异步JS执行)
	 *
	 * @param url 页面URL
	 * @return
	 * @throws Exception
	 */
	public String getHtmlPageResponse(String url) throws Exception {
		String result = "";

		final WebClient webClient = new WebClient(BrowserVersion.CHROME);

		webClient.getOptions().setThrowExceptionOnScriptError(false);//当JS执行出错的时候是否抛出异常
		webClient.getOptions().setThrowExceptionOnFailingStatusCode(false);//当HTTP的状态非200时是否抛出异常
		webClient.getOptions().setActiveXNative(false);
		webClient.getOptions().setCssEnabled(false);//是否启用CSS
		webClient.getOptions().setJavaScriptEnabled(true); //很重要，启用JS
		webClient.setAjaxController(new NicelyResynchronizingAjaxController());//很重要，设置支持AJAX

		webClient.getOptions().setTimeout(timeout);//设置“浏览器”的请求超时时间
		webClient.setJavaScriptTimeout(timeout);//设置JS执行的超时时间

		HtmlPage page;
		try {
			page = webClient.getPage(url);
		} catch (Exception e) {
			webClient.close();
			throw e;
		}
		webClient.waitForBackgroundJavaScript(waitForBackgroundJavaScript);//该方法阻塞线程

		result = page.asXml();
		webClient.close();

		return result;
	}
	

	public static void main(String[] args) {
		String url = "http://9.111.221.116:8080/CTAP/app/#/login";
		GetPageUtil getPageUtil = GetPageUtil.getInstance();
		getPageUtil.setCharset("UTF-8");
		getPageUtil.setTimeout(30000);
		getPageUtil.setWaitForBackgroundJavaScript(30000);
		try {
			Document document = getPageUtil.getHtmlPageResponseAsDocument(url);
			//TODO
			System.out.println(document);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

}
