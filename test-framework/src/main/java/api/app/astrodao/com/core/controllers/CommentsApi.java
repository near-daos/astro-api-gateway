package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.clients.HttpClient;
import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.openapi.models.CommentDto;
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
public class CommentsApi {
    protected final HttpClient httpClient;

    @Value("${framework.api.url}")
    private String apiUrl;

    public ResponseEntity<String> getComments(Map<String, Object> queryParams) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("comments");
        queryParams.forEach((key, value) -> builder.queryParam(key, value));

        return httpClient.get(builder.toUriString(), new HttpEntity<>(httpHeaders), String.class);
    }

    public ResponseEntity<String> createComment(String accountId, String publicKey, String signature, String contextId, String contextType, String message) {
        HttpHeaders httpHeaders = httpClient.getBasicHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        httpHeaders.setAccept(Collections.singletonList(MediaType.ALL));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl);
        builder.pathSegment("comments");

        CommentDto commentDto = new CommentDto();
        commentDto.setAccountId(accountId);
        commentDto.setPublicKey(publicKey);
        commentDto.setSignature(signature);
        commentDto.setContextId(contextId);
        commentDto.setContextType(contextType);
        commentDto.setMessage(message);

        HttpEntity<?> httpEntity = new HttpEntity<>(JsonUtils.writeValueAsString(commentDto), httpHeaders);
        return httpClient.post(builder.toUriString(), httpEntity, String.class);
    }
}
