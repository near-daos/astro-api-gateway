package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.openapi.models.PatchSettingsBodyDto;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.Endpoints.*;
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

    public Response getAccountDaos(String accountId) {
        return given().spec(requestSpec)
                .accept(ContentType.JSON)
                .get(ACCOUNT_DAOS, accountId);
    }

    public Response patchDaoSettings(String accountId, Map<String, String> json, String authToken) {
        PatchSettingsBodyDto patchSettings = new PatchSettingsBodyDto();
        patchSettings.setSettings(json);

        return given().spec(requestSpec)
                .accept(ContentType.JSON)
                .header("Authorization", "Bearer " + authToken)
                .contentType(ContentType.JSON)
                .body(JsonUtils.writeValueAsString(patchSettings))
                .patch(DAOS_DAO_ID_SETTINGS, accountId);


    }

    public Response getDaoSettings(String daoId) {
        return given().spec(requestSpec)
                .accept(ContentType.JSON)
                .get(DAOS_DAO_ID_SETTINGS, daoId);
    }
}
