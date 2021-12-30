package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.DaoApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class DaoApiSteps extends BaseSteps {
    private final DaoApi daoApi;

    @Step("Getting DAO by it's ID")
    public ResponseEntity<String> getDAOByID(String daoId) {
        return daoApi.getDaoByID(daoId);
    }

    @Step("Getting DAOs with '{queryParams}' query params")
    public ResponseEntity<String> getDaos(Map<String, Object> queryParams) {
        return daoApi.getDaos(queryParams);
    }

    @Step("Getting DAOs feed with '{queryParams}' query params")
    public ResponseEntity<String> getDaosFeed(Map<String, Object> queryParams) {
        return daoApi.getDaosFeed(queryParams);
    }

    @Step("Getting feed for '{id}' DAO")
    public ResponseEntity<String> getDaoFeed(String id) {
        return daoApi.getDaoFeed(id);
    }
}
