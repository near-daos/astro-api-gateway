package api.app.astrodao.com.steps.apiservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.apiservice.DaoApi;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class DaoApiSteps extends BaseSteps {
    private final DaoApi daoApi;

    @Step("Getting DAO by it's ID")
    public Response getDAOByID(String daoId) {
        return daoApi.getDaoByID(daoId);
    }

    @Step("Getting DAOs with '{queryParams}' query params")
    public Response getDaos(Map<String, Object> queryParams) {
        return daoApi.getDaos(queryParams);
    }

    @Step("Getting Account DAOs by account id '{accountId}'")
    public Response getAccountDaos(String accountId) {
        return daoApi.getAccountDaos(accountId);
    }

    @Step("Patch DAO settings by daoId '{daoId}'")
    public Response patchDaoSettings(String daoId, Map<String, String> json, String authToken) {
        return daoApi.patchDaoSettings(daoId, json, authToken);
    }

    @Step("Get DAO settings by daoId '{daoId}'")
    public Response getDaoSettings(String daoId) {
        return daoApi.getDaoSettings(daoId);
    }

    @Step("Patch DAO '{daoId}' settings with new value by key '{key}'")
    public Response patchDaoSettingsByKey(String daoId, String key, String newValue, String authToken) {
        return daoApi.patchDaoSettingsByKey(daoId, key, newValue, authToken);
    }

    @Step("Get DAO members by DAO id '{daoId}' parameter")
    public Response getDaoMembers(String daoId) {
        return daoApi.getDaoMembers(daoId);
    }
}
