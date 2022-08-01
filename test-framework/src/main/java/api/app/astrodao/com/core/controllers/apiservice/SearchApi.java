package api.app.astrodao.com.core.controllers.apiservice;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.Endpoints.SEARCH;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class SearchApi {
    private final RequestSpecification requestSpecForApiService;

    public Response search(Map<String, Object> queryParams) {
        return given().spec(requestSpecForApiService)
                .queryParams(queryParams)
                .accept(ContentType.JSON)
                .get(SEARCH);
    }
}
