package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.CommentsApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class CommentsApiSteps extends BaseSteps {
    private final CommentsApi commentsApi;

    @Step("Getting comments with '{queryParams}' query params")
    public ResponseEntity<String> getComments(Map<String, Object> queryParams) {
        return commentsApi.getComments(queryParams);
    }

    @Step("Creating a new comment")
    public ResponseEntity<String> createComment(String accountId, String publicKey, String signature, String contextId, String contextType, String message) {
        return commentsApi.createComment(accountId, publicKey, signature, contextId, contextType, message);
    }
}
