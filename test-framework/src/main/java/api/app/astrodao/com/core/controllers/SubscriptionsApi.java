package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.clients.HttpClient;
import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.openapi.models.SubscriptionDeleteDto;
import api.app.astrodao.com.openapi.models.SubscriptionDto;
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
public class SubscriptionsApi {
    protected final HttpClient httpClient;

    @Value("${framework.api.url}")
    private String apiUrl;

    public ResponseEntity<String> subscribeDao(String accountId, String publicKey, String signature, String daoId) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        httpHeaders.setAccept(Collections.singletonList(MediaType.ALL));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("subscriptions");

        SubscriptionDto subscriptionDto = new SubscriptionDto();
        subscriptionDto.setAccountId(accountId);
        subscriptionDto.setPublicKey(publicKey);
        subscriptionDto.setSignature(signature);
        subscriptionDto.setDaoId(daoId);

        HttpEntity<?> httpEntity = new HttpEntity<>(JsonUtils.writeValueAsString(subscriptionDto), httpHeaders);
        return httpClient.post(builder.toUriString(), httpEntity, String.class);
    }

    public ResponseEntity<String> accountSubscriptions(String accountId) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("subscriptions", "account-subscriptions", "{accountId}");

        return httpClient.get(builder.build().toString(), new HttpEntity<>(httpHeaders), String.class, accountId);
    }

    public ResponseEntity<String> deleteSubscription(String accountId, String publicKey, String signature, String daoId) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        httpHeaders.setAccept(Collections.singletonList(MediaType.ALL));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("subscriptions", daoId);

        SubscriptionDeleteDto subscriptionDto = new SubscriptionDeleteDto();
        subscriptionDto.setAccountId(accountId);
        subscriptionDto.setPublicKey(publicKey);
        subscriptionDto.setSignature(signature);

        HttpEntity<?> httpEntity = new HttpEntity<>(JsonUtils.writeValueAsString(subscriptionDto), httpHeaders);
        return httpClient.delete(builder.toUriString(), httpEntity, String.class);
    }
}
