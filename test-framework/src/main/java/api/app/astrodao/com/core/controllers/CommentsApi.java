package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.openapi.models.CommentDeleteDto;
import api.app.astrodao.com.openapi.models.CommentDto;
import api.app.astrodao.com.openapi.models.CommentReportDto;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

import static api.app.astrodao.com.core.Constants.Endpoints.*;
import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;

@Component
@RequiredArgsConstructor
public class CommentsApi {
    private final RequestSpecification requestSpec;

    public Response getComments(Map<String, Object> queryParams) {
        return given().spec(requestSpec)
                .accept(JSON)
                .queryParams(queryParams)
                .get(COMMENTS);
    }

    public Response createComment(String accountId, String publicKey, String signature, String contextId, String contextType, String message) {
        CommentDto commentDto = new CommentDto();
        commentDto.setAccountId(accountId);
        commentDto.setPublicKey(publicKey);
        commentDto.setSignature(signature);
        commentDto.setContextId(contextId);
        commentDto.setContextType(contextType);
        commentDto.setMessage(message);

        return given().spec(requestSpec)
                .accept(JSON)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(commentDto))
                .post(COMMENTS);
    }

    public Response reportComment(String accountId, String publicKey, String signature, BigDecimal commentId, String reason) {
        CommentReportDto commentDto = new CommentReportDto();
        commentDto.setAccountId(accountId);
        commentDto.setPublicKey(publicKey);
        commentDto.setSignature(signature);
        commentDto.setCommentId(commentId);
        commentDto.setReason(reason);

        return given().spec(requestSpec)
                .accept(JSON)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(commentDto))
                .post(COMMENTS_REPORT);
    }

    public Response deleteComment(String accountId, String publicKey, String signature, BigDecimal commentId, String reason) {
        CommentDeleteDto commentDto = new CommentDeleteDto();
        commentDto.setAccountId(accountId);
        commentDto.setPublicKey(publicKey);
        commentDto.setSignature(signature);
        commentDto.setReason(reason);

        return given().spec(requestSpec)
                .accept(JSON)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(commentDto))
                .delete(COMMENTS_ID, commentId.toString());
    }
}
