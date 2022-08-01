package api.app.astrodao.com.steps.apiservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.CommentsApi;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Steps
@RequiredArgsConstructor
public class CommentsApiSteps extends BaseSteps {
    private final CommentsApi commentsApi;

    @Step("Getting comments with '{queryParams}' query params")
    public Response getComments(Map<String, Object> queryParams) {
        return commentsApi.getComments(queryParams);
    }

    @Step("Creating a new comment")
    public Response createComment(String contextId, String contextType, String message, String authToken) {
        return commentsApi.createComment(contextId, contextType, message, authToken);
    }

    @Step("Creating a new report for a comment")
    public Response reportComment(BigDecimal commentId, String reason, String authToken) {
        return commentsApi.reportComment(commentId, reason, authToken);
    }

    @Step("Delete an existing comment")
    public Response deleteComment(BigDecimal commentId, String reason, String authToken) {
        return commentsApi.deleteComment(commentId, reason, authToken);
    }
}
