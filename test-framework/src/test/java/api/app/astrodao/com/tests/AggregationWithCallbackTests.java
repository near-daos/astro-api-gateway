package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.dao.DAODto;
import api.app.astrodao.com.core.dto.api.proposals.ProposalDto;
import api.app.astrodao.com.core.dto.cli.AddProposalResponse;
import api.app.astrodao.com.core.dto.cli.CLIResponse;
import api.app.astrodao.com.core.dto.cli.dao.*;
import api.app.astrodao.com.core.dto.cli.proposals.bounty.*;
import api.app.astrodao.com.core.dto.cli.proposals.poll.PollProposal;
import api.app.astrodao.com.core.dto.cli.proposals.poll.PollProposalDto;
import api.app.astrodao.com.core.dto.cli.proposals.transfer.Transfer;
import api.app.astrodao.com.core.dto.cli.proposals.transfer.TransferProposalDto;
import api.app.astrodao.com.core.dto.cli.proposals.view.ViewProposal;
import api.app.astrodao.com.core.dto.cli.proposals.view.bounty.ViewAddBountyProposal;
import api.app.astrodao.com.core.dto.cli.proposals.view.transfer.ViewTransferProposal;
import api.app.astrodao.com.steps.DaoApiSteps;
import api.app.astrodao.com.steps.NearCLISteps;
import api.app.astrodao.com.steps.ProposalsApiSteps;
import api.app.astrodao.com.steps.TransactionsSteps;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static api.app.astrodao.com.core.utils.WaitUtils.getEpochMillis;
import static org.apache.commons.lang3.StringUtils.EMPTY;

@Tag("all")
@Feature("AGGREGATION WITH CALLBACK TESTS")
@DisplayName("AGGREGATION WITH CALLBACK TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AggregationWithCallbackTests extends BaseTest {
    private final Faker faker;
    private final NearCLISteps nearCLISteps;
    private final ProposalsApiSteps proposalsApiSteps;
    private final TransactionsSteps transactionsSteps;
    private final DaoApiSteps daoApiSteps;

    @Value("${test.accountId}")
    private String testAccountId;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created DAO via Sputnik v2 API")
    @DisplayName("User should be able to get newly created DAO via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedDaoViaSputnikV2Api() {
        float deposit = 5F;
        long gasValue = 100000000000000L;
        String daoDisplayName = String.format("Test DAO %s", getEpochMillis());
        String daoName = daoDisplayName.toLowerCase().replaceAll("\\s", "-");
        String daoId = String.format("%s.sputnikv2.testnet", daoName);
        String daoPurpose = faker.lorem().characters(20, 30);
        String bond = "100000000000000000000000";
        String period = "604800000000000";
        String gracePeriod = "86400000000000";

        Role<KindWithGroup> role = Role.<KindWithGroup>of()
                .setName("Council")
                .setKind(KindWithGroup.of(List.of(testAccountId)))
                .setPermissions(List.of("*:Finalize", "*:AddProposal", "*:VoteApprove", "*:VoteReject", "*:VoteRemove"))
                .setVotePolicy(VotePolicy.of());

        DefaultVotePolicy defaultVotePolicy = DefaultVotePolicy.of()
                .setWeightKind("RoleWeight")
                .setQuorum("0")
                .setThreshold(List.of(1, 2));

        Policy policy = Policy.of()
                .setRoles(List.of(role))
                .setDefaultVotePolicy(defaultVotePolicy)
                .setProposalBond(bond)
                .setProposalPeriod(period)
                .setBountyBond(bond)
                .setBountyForgivenessPeriod(period);

        Metadata metadata = Metadata.of().setFlag("c1vdoupozsy28WZc2tm5e").setDisplayName(daoDisplayName);
        Config config = Config.of(daoName, daoPurpose, metadata);

        DAOArgs daoArgs = DAOArgs.of()
                .setPurpose(daoPurpose)
                .setBond(bond)
                .setVotePeriod(period)
                .setGracePeriod(gracePeriod)
                .setPolicy(policy)
                .setConfig(config);

        NewDAODto newDaoDto = NewDAODto.of(daoName, daoArgs);
        CLIResponse output = nearCLISteps.createNewDao(newDaoDto, testAccountId, gasValue, deposit);

        Config viewConfig = nearCLISteps.getDaoConfig(daoId);
        daoApiSteps.assertDtoValue(viewConfig, Config::getName, daoName, "name");
        daoApiSteps.assertDtoValue(viewConfig, Config::getPurpose, daoPurpose, "purpose");

        ResponseEntity<String> callbackResponse = transactionsSteps.triggerCallback(testAccountId, output.getTransactionHash());
        proposalsApiSteps.assertResponseStatusCode(callbackResponse, HttpStatus.OK);

        ResponseEntity<String> response = daoApiSteps.getDAOByID(daoId);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DAODto daoDto = daoApiSteps.getResponseDto(response, DAODto.class);
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getIsArchived, Boolean.FALSE, "isArchived");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getId, daoId, "id");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getUpdateTransactionHash, output.getTransactionHash(), "updateTransactionHash");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getName(), daoName, "config/name");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getPurpose(), daoPurpose, "config/purpose");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getMetadata(), config.getMetadata(), "config/metadata");
        //TODO: Add verification for amount
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getAmount, "5000071399234288200000000", "amount");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getCreatedBy, testAccountId, "createdBy");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getTotalSupply, "0", "totalSupply");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getNumberOfMembers, 1, "numberOfMembers");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getProposalBond(), bond, "policy/proposalBond");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getBountyBond(), bond, "policy/bountyBond");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getBountyForgivenessPeriod(), period, "policy/bountyForgivenessPeriod");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getProposalPeriod(), period, "policy/proposalPeriod");
        daoApiSteps.assertCollectionHasCorrectSize(daoDto.getPolicy().getRoles(), 1);
        daoApiSteps.assertCollectionsAreEqual(daoDto.getPolicy().getRoles().get(0).getPermissions(), role.getPermissions());
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getRoles().get(0).getName(), role.getName(), "policy/roles[1]/name");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created poll proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created poll proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedPollProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        PollProposal pollProposal = PollProposal.of(String.format("Poll created with NEAR CLI %s", getEpochMillis()), "Vote");
        PollProposalDto pollProposalDto = PollProposalDto.of(pollProposal);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, pollProposalDto, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ViewProposal viewProposal = nearCLISteps.getProposalById(daoName, output.getId(), ViewProposal.class);
        proposalsApiSteps.assertDtoValue(viewProposal, ViewProposal::getId, output.getId(), "id");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewProposal::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewProposal::getDescription, pollProposal.getDescription(), "description");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewProposal::getStatus, "InProgress", "status");

        ResponseEntity<String> callbackResponse = transactionsSteps.triggerCallback(testAccountId, output.getTransactionHash());
        proposalsApiSteps.assertResponseStatusCode(callbackResponse, HttpStatus.OK);

        ResponseEntity<String> responseEntity = proposalsApiSteps.getProposalByID(proposalID);
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, pollProposal.getDescription(), "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), pollProposal.getKind(), "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created transfer proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created transfer proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedTransferProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String receiverId = "roman-account.testnet";
        String amount = "3500000000000000000000000"; //3.5 NEAR
        String description = String.format("Donation via NEAR CLI %s", getEpochMillis());

        Transfer transfer = Transfer.of().setReceiverId(receiverId).setAmount(amount).setTokenId(EMPTY);
        TransferProposalDto transferProposal = TransferProposalDto.of(description, transfer);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, transferProposal, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ViewTransferProposal viewProposal = nearCLISteps.getProposalById(daoName, output.getId(), ViewTransferProposal.class);
        proposalsApiSteps.assertDtoValue(viewProposal, ViewTransferProposal::getId, output.getId(), "id");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewTransferProposal::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewTransferProposal::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewTransferProposal::getStatus, "InProgress", "status");

        ResponseEntity<String> callbackResponse = transactionsSteps.triggerCallback(testAccountId, output.getTransactionHash());
        proposalsApiSteps.assertResponseStatusCode(callbackResponse, HttpStatus.OK);

        ResponseEntity<String> responseEntity = proposalsApiSteps.getProposalByID(proposalID);
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "Transfer", "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created add bounty proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created add bounty proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedAddBountyProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = "Google for Instagram trends in 2018 Q1" + getEpochMillis();
        String amount = "500000000000000000000000"; //0.5 NEAR
        Bounty bounty = Bounty.of()
                .setDescription(description)
                .setToken(EMPTY)
                .setAmount(amount)
                .setMaxDeadline("259200000000000")
                .setTimes(3);
        Proposal proposal = Proposal.of()
                .setDescription(description)
                .setKind(Kind.of(AddBounty.of(bounty)));
        BountyProposalDto bountyProposal = BountyProposalDto.of(proposal);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, bountyProposal, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ViewAddBountyProposal viewProposal = nearCLISteps.getProposalById(daoName, output.getId(), ViewAddBountyProposal.class);
        proposalsApiSteps.assertDtoValue(viewProposal, ViewAddBountyProposal::getId, output.getId(), "id");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewAddBountyProposal::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewAddBountyProposal::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(viewProposal, ViewAddBountyProposal::getStatus, "InProgress", "status");

        ResponseEntity<String> callbackResponse = transactionsSteps.triggerCallback(testAccountId, output.getTransactionHash());
        proposalsApiSteps.assertResponseStatusCode(callbackResponse, HttpStatus.OK);

        ResponseEntity<String> responseEntity = proposalsApiSteps.getProposalByID(proposalID);
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "AddBounty", "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
    }
}
