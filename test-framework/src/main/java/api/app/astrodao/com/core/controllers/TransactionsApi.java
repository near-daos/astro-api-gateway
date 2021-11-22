package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.clients.HttpClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class TransactionsApi {
    protected final HttpClient httpClient;

    @Value("${framework.api.url}")
    private String apiUrl;

    @Value("${framework.app.url}")
    private String appUrl;

    public ResponseEntity<String> triggerCallback(String accountId, String transactionHashes) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.ALL));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("transactions", "wallet", "callback", accountId);
        builder.queryParam("transactionHashes", transactionHashes);

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }
}
