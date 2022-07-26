package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.openapi.models.PatchSettingsBodyDto;
import api.app.astrodao.com.openapi.models.PatchSettingsParamBodyDto;
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
    private final RequestSpecification requestSpecForApiService;

    public Response getDaoByID(String daoId) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(DAOS_ID, daoId);
    }

    public Response getDaos(Map<String, Object> queryParams) {
        return given().spec(requestSpecForApiService)
                .queryParams(queryParams)
                .accept(ContentType.JSON)
                .get(DAOS);
    }

    public Response getAccountDaos(String accountId) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(ACCOUNT_DAOS, accountId);
    }

    public Response patchDaoSettings(String accountId, Map<String, String> json, String authToken) {
        PatchSettingsBodyDto patchSettings = new PatchSettingsBodyDto();
        patchSettings.setSettings(json);

        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .header("Authorization", "Bearer " + authToken)
                .contentType(ContentType.JSON)
                .body(JsonUtils.writeValueAsString(patchSettings))
                .patch(DAOS_DAO_ID_SETTINGS, accountId);


    }

    public Response getDaoSettings(String daoId) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(DAOS_DAO_ID_SETTINGS, daoId);
    }

    public Response patchDaoSettingsByKey(String daoId, String key, String newValue, String authToken) {
        PatchSettingsParamBodyDto patchSettingsParamBodyDto = new PatchSettingsParamBodyDto();
        patchSettingsParamBodyDto.setValue(newValue);

        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .header("Authorization", "Bearer " + authToken)
                .contentType(ContentType.JSON)
                .body(JsonUtils.writeValueAsString(patchSettingsParamBodyDto))
                .patch(DAOS_DAO_ID_SETTINGS_KEY, daoId, key);
    }

    public Response getDaoMembers(String daoId) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(DAOS_DAO_ID_MEMBERS, daoId);
    }
}
