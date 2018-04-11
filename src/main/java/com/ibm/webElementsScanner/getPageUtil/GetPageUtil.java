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
	 * ����ʱʱ��,Ĭ��20000ms
	 */
	private int timeout = 20000;
	/**
	 * �ȴ��첽JSִ��ʱ��,Ĭ��20000ms
	 */
	private int waitForBackgroundJavaScript = 20000;
	/**
	 * cookie��
	 */
	private Map<String, String> cookieMap = new HashMap<String,String>();

	/**
	 * �������(�����ؽ��)��Ĭ��UTF-8
	 */
	private String charset = "UTF-8";

	private static GetPageUtil getPageUtil;

	private GetPageUtil() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * ��ȡʵ��
	 *
	 * @return
	 */
	public static GetPageUtil getInstance() {
		if (getPageUtil == null)
			getPageUtil = new GetPageUtil();
		return getPageUtil;
	}

	/**
	 * ���cookieMap
	 */
	public void invalidCookieMap() {
		cookieMap.clear();
	}

	public int getTimeout() {
		return timeout;
	}

	/**
	 * ��������ʱʱ��
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
	 * ���������ַ����뼯
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
	 * ���û�ȡ����HTMLҳ��ʱ�ȴ��첽JSִ�е�ʱ��
	 *
	 * @param waitForBackgroundJavaScript
	 */
	public void setWaitForBackgroundJavaScript(int waitForBackgroundJavaScript) {
		this.waitForBackgroundJavaScript = waitForBackgroundJavaScript;
	}
	
	
	/**
	 * ����ҳ����Ϊ��������ĵ���ʽ
	 * 
	 * @param html
	 * @return
	 * @throws Exception
	 */
	public static Document parseHtmlToDoc(String html) throws Exception {
		return removeHtmlSpace(html);
	}
	
	/**
	 * ��ȡҳ���ĵ�Document����(�ȴ��첽JSִ��)
	 *
	 * @param url ҳ��URL
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
	 * ��ȡҳ���ĵ��ִ�(�ȴ��첽JSִ��)
	 *
	 * @param url ҳ��URL
	 * @return
	 * @throws Exception
	 */
	public String getHtmlPageResponse(String url) throws Exception {
		String result = "";

		final WebClient webClient = new WebClient(BrowserVersion.CHROME);

		webClient.getOptions().setThrowExceptionOnScriptError(false);//��JSִ�г����ʱ���Ƿ��׳��쳣
		webClient.getOptions().setThrowExceptionOnFailingStatusCode(false);//��HTTP��״̬��200ʱ�Ƿ��׳��쳣
		webClient.getOptions().setActiveXNative(false);
		webClient.getOptions().setCssEnabled(false);//�Ƿ�����CSS
		webClient.getOptions().setJavaScriptEnabled(true); //����Ҫ������JS
		webClient.setAjaxController(new NicelyResynchronizingAjaxController());//����Ҫ������֧��AJAX

		webClient.getOptions().setTimeout(timeout);//���á��������������ʱʱ��
		webClient.setJavaScriptTimeout(timeout);//����JSִ�еĳ�ʱʱ��

		HtmlPage page;
		try {
			page = webClient.getPage(url);
		} catch (Exception e) {
			webClient.close();
			throw e;
		}
		webClient.waitForBackgroundJavaScript(waitForBackgroundJavaScript);//�÷��������߳�

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
