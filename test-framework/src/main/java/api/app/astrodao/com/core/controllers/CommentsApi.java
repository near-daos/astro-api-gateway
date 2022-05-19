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

    public Response createComment(String contextId, String contextType, String message, String authToken) {
        CommentDto commentDto = new CommentDto();
        commentDto.setContextId(contextId);
        commentDto.setContextType(contextType);
        commentDto.setMessage(message);

        return given().spec(requestSpec)
                .accept(JSON)
                .header("Authorization", "Bearer " + authToken)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(commentDto))
                .post(COMMENTS);
    }

    public Response reportComment(BigDecimal commentId, String reason, String authToken) {
        CommentReportDto commentDto = new CommentReportDto();
        commentDto.setCommentId(commentId);
        commentDto.setReason(reason);

        return given().spec(requestSpec)
                .accept(JSON)
                .header("Authorization", "Bearer " + authToken)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(commentDto))
                .post(COMMENTS_REPORT);
    }

    public Response deleteComment(BigDecimal commentId, String reason, String authToken) {
        CommentDeleteDto commentDto = new CommentDeleteDto();
        commentDto.setReason(reason);

        return given().spec(requestSpec)
                .accept(JSON)
                .header("Authorization", "Bearer " + authToken)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(commentDto))
                .delete(COMMENTS_ID, commentId.toString());
    }
}
