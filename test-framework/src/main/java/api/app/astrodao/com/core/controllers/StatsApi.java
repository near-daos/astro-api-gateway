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
public class StatsApi {
    protected final HttpClient httpClient;

    @Value("${framework.api.url}")
    private String apiUrl;

    public ResponseEntity<String> getStateForDao(String dao) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("stats", "dao", dao, "state");

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }

    public ResponseEntity<String> getFundsForDao(String dao) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("stats", "dao", dao, "funds");

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }

    public ResponseEntity<String> getBountiesForDao(String dao) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("stats", "dao", dao, "bounties");

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }

    public ResponseEntity<String> getNFTsForDao(String dao) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("stats", "dao", dao, "nfts");

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }

    public ResponseEntity<String> getProposalsForDao(String dao) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("stats", "dao", dao, "proposals");

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }
}
