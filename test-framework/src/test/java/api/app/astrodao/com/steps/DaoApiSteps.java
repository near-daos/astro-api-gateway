package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.DaoApi;
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
}
