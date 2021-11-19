package api.app.astrodao.com.core.clients;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class HttpClient {
    private final RestTemplate restTemplate;

    public HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("User-Agent", "Test Framework");
        return headers;
    }

    public HttpHeaders getBasicHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Test Framework");
        return headers;
    }

    public <T> ResponseEntity<T> post(String url, HttpEntity<?> requestEntity, Class<T> responseType) {
        return restTemplate.exchange(url, HttpMethod.POST, requestEntity, responseType);
    }

    public <T> ResponseEntity<T> put(String url, HttpEntity<?> requestEntity, Class<T> responseType) {
        return restTemplate.exchange(url, HttpMethod.PUT, requestEntity, responseType);
    }

    public <T> ResponseEntity<T> get(String url, Class<T> responseType, Object... urlVariables) {
        return restTemplate.getForEntity(url, responseType, urlVariables);
    }

    public <T> ResponseEntity<T> get(String url, HttpEntity<?> requestEntity, Class<T> responseType) {
        return restTemplate.exchange(url, HttpMethod.GET, requestEntity, responseType);
    }

    public <T> ResponseEntity<T> get(String url, HttpEntity<?> requestEntity, Class<T> responseType,
                                     Object... urlVariables) {
        return restTemplate.exchange(url, HttpMethod.GET, requestEntity, responseType, urlVariables);
    }

    public <T> ResponseEntity<T> patch(String url, HttpEntity<?> requestEntity, Class<T> responseType,
                                       Object... urlVariables) {
        return restTemplate.exchange(url, HttpMethod.PATCH, requestEntity, responseType, urlVariables);
    }

    public <T> ResponseEntity<T> delete(String url, HttpEntity<?> requestEntity, Class<T> responseType) {
        return restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, responseType);
    }

    public <T> ResponseEntity<T> delete(String url, HttpEntity<?> requestEntity, Class<T> responseType,
                                        Object... urlVariables) {
        return restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, responseType, urlVariables);
    }
}
