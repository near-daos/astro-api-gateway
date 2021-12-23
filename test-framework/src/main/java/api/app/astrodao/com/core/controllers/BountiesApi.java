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
import java.util.Map;

@Component
@RequiredArgsConstructor
public class BountiesApi {
    protected final HttpClient httpClient;

    @Value("${framework.api.url}")
    private String apiUrl;

    public ResponseEntity<String> getBountyByID(String bountyId) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("bounties", bountyId);

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }

    public ResponseEntity<String> getBounties(Map<String, Object> queryParams) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("bounties");
        queryParams.forEach((key, value) -> builder.queryParam(key, value));

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }
}
