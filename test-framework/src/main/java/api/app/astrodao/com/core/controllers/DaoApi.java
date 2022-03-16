package api.app.astrodao.com.core.controllers;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.Endpoints.DAOS;
import static api.app.astrodao.com.core.Constants.Endpoints.DAOS_ID;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class DaoApi {
    private final RequestSpecification requestSpec;

    public Response getDaoByID(String daoId) {
        return given().spec(requestSpec)
                .accept(ContentType.JSON)
                .get(DAOS_ID, daoId);
    }

    public Response getDaos(Map<String, Object> queryParams) {
        return given().spec(requestSpec)
                .queryParams(queryParams)
                .accept(ContentType.JSON)
                .get(DAOS);
    }
}
