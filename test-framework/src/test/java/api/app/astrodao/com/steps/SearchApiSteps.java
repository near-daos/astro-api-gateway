package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.SearchApi;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class SearchApiSteps extends BaseSteps {
    private final SearchApi searchApi;

    @Step("Searching with '{queryParams}' query params")
    public Response search(Map<String, Object> queryParams) {
        return searchApi.search(queryParams);
    }
}
